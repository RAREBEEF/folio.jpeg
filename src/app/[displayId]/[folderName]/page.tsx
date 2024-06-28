"use client";

import PageHeader from "@/components/layouts/PageHeader";
import FolderDetail from "@/components/user/FolderDetail";
import _ from "lodash";
import { useRecoilState } from "recoil";
import { foldersState } from "@/recoil/states";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useGetExtraUserData from "@/hooks/useGetExtraUserData";
import useGetFolders from "@/hooks/useGetFolders";
import { Folder } from "@/types";

const FolderDetailPage = () => {
  const { replace } = useRouter();
  const { folderName: folderNameParam, displayId: dpid } = useParams();
  const [pageUid, setPageUid] = useState<string>("");
  const [folders, setFolders] = useRecoilState(foldersState(pageUid));
  const { getExtraUserData, isLoading: isExtraUserDataLoading } =
    useGetExtraUserData();
  const { getFolders, isLoading: isFolderLoading } = useGetFolders();
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const folderName = useMemo(
    (): string =>
      decodeURIComponent(
        JSON.stringify(folderNameParam)
          .replaceAll('"', "")
          .replaceAll("-", " "),
      ),
    [folderNameParam],
  );
  const displayId = useMemo(
    (): string => decodeURIComponent(JSON.stringify(dpid).replaceAll('"', "")),
    [dpid],
  );

  // 폴더 주인의 uid 초기화
  useEffect(() => {
    if (typeof displayId !== "string" || isExtraUserDataLoading) return;

    // 세션 스토리지에 저장된 pageUid 존재하면 (유저페이지에서 폴더를 클릭해 링크 이동했을 때)
    const storedUid = sessionStorage.getItem("curpi");
    if (storedUid) {
      setPageUid(storedUid);
      sessionStorage.removeItem("curpi");
      // 저장된 pageUid 없으면 (유저페이지 외 다른 경로로 폴더 페이지에 들어왔을 때)
      // db에서 uid를 새로 불러온다.
    } else {
      if (!folders && !pageUid) {
        (async () => {
          const extraUserData = await getExtraUserData(displayId);
          if (extraUserData?.data) {
            setPageUid(extraUserData.data.uid);
          } else {
            // extraUserData 없으면 홈으로
            replace("/");
          }
        })();
      }
    }
  }, [
    displayId,
    folders,
    getExtraUserData,
    isExtraUserDataLoading,
    pageUid,
    replace,
  ]);

  // 폴더 목록 초기화
  useEffect(() => {
    if (isFolderLoading) return;

    // 현재 폴더 주인의 폴더 목록 데이터가 없지만 uid는 있다면
    if (!folders && pageUid) {
      // db에서 해당 유저의 폴더 목록 데이터 불러오기
      (async () => {
        await getFolders(pageUid)
          .then((folders) => {
            // 폴더 목록 데이터가 존재하지 않거나 불러온 폴더의 uid와 현재 갖고 있는 uid가 일치하지 않으면
            if (!folders || folders.length <= 0 || folders[0].uid !== pageUid) {
              // 홈으로 이동
              replace("/");
            } else {
              //  데이터가 정상이면 폴더 목록 상태 업데이트
              setFolders(folders);
            }
          })
          .catch((error) => {
            replace("/");
          });
      })();
    }
  }, [folders, getFolders, isFolderLoading, pageUid, replace, setFolders]);

  // 현재 폴더 초기화(폴더 목록에서 현재 폴더 찾기)
  useEffect(() => {
    // 폴더 목록이 없으면 돌아간다.
    if (!folders) return;

    // 폴더 목록에서 폴더이름과 uid가 일치하는 폴더 찾기
    const curFolder = folders.find(
      (folder) => folder.name === folderName && folder.uid === pageUid,
    );

    if (!curFolder) {
      replace(`/${displayId}`);
      return;
    }

    // 현재 폴더 상태 업데이트
    setCurrentFolder(curFolder);
  }, [displayId, folders, pageUid, folderName, replace]);

  return (
    <main>
      <PageHeader header={currentFolder?.name || ""} />
      <FolderDetail
        currentFolder={currentFolder}
        pageUid={pageUid}
        displayId={displayId}
      />
    </main>
  );
};

export default FolderDetailPage;
