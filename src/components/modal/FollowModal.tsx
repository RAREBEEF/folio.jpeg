import useGetUsersByUids from "@/hooks/useGetUsersByUids";
import { userDataState, usersDataState } from "@/recoil/states";
import { UserData } from "@/types";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import ProfileCard from "@/components/user/ProfileCard";
import Loading from "@/components/loading/Loading";

const FollowModal = ({ users }: { users: Array<string> }) => {
  const loadRef = useRef<HTMLDivElement>(null);
  const { getUsersByUid, isLoading } = useGetUsersByUids();
  const [userStack, setUserStack] = useState<Array<string>>(users);
  const [usersData, setUsersData] = useRecoilState(usersDataState);
  const [userList, setUserList] = useState<Array<UserData>>([]);

  // users의 user들 데이터 불러오기
  const loadUsers = useCallback(async () => {
    const curUserStack = _.cloneDeep(userStack);
    // 맨 앞 2명만 자르기
    const curUsers = curUserStack.splice(0, 2);
    // 2명을 뺀 스택은 다시 상태에 저장
    setUserStack(curUserStack);

    // 상태가 존재하는 유저와 그렇지 않은 유저 구분
    const loadedUsers: Array<string> = [];
    const notLoadedUsers = curUsers.filter((uid) => {
      if (Object.keys(usersData).includes(uid)) {
        loadedUsers.push(uid);
        return false;
      } else {
        return true;
      }
    });

    // 포함 안된 인원은 불러온다.
    const notLoadedUsersData = await getUsersByUid({ uids: notLoadedUsers });
    const loadedUsersData = loadedUsers.map((uid) => usersData[uid]);

    // 모두 불러와지면 목록에 추가
    setUserList((prev) => [...prev, ...notLoadedUsersData, ...loadedUsersData]);
  }, [getUsersByUid, userStack, usersData]);

  // 무한 스크롤에 사용할 옵저버 (뷰포트에 감지되면 다음 페이지 불러온다.)
  useEffect(() => {
    const loadBtn = loadRef.current;
    if (!loadBtn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await loadUsers();
        }
      });
    });
    observer.observe(loadBtn);

    return () => {
      observer.unobserve(loadBtn);
    };
  }, [loadUsers]);

  return (
    <div className="h-[40vh] max-h-[500px] min-h-[200px]">
      <ul className="flex flex-col gap-4 p-4 px-6">
        {!isLoading && userList.length <= 0 ? (
          <div className="text-center text-shark-700">목록이 비어있습니다.</div>
        ) : (
          userList.map((user, i) => (
            <li key={i}>
              <ProfileCard profileData={user} />
            </li>
          ))
        )}
      </ul>
      {!isLoading && userStack.length > 0 && (
        <div
          ref={loadRef}
          className="pb-24 pt-12 text-center text-sm text-shark-500"
        >
          <Loading />
        </div>
      )}
    </div>
  );
};

export default FollowModal;
