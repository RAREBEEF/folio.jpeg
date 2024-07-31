const GeminiInfoModal = () => {
  return (
    <ul className="flex flex-col gap-4 break-keep p-8 pb-16 pt-0">
      <li>
        <h3 className="text-lg font-semibold">Gemini AI란?</h3>
        <div className="pl-1">
          구글의 차세대 인공지능 챗봇으로, Gemini를 통해 구글의 AI에 직접
          엑세스할 수 있습니다.
        </div>
      </li>
      <li>
        <h3 className="text-lg font-semibold">이미지 분석 결과 종합</h3>
        <div className="pl-1">
          Gemini에게 사용자가 최근 업로드한 최대 10개 이미지의 분석 결과를
          종합하여 피드백을 요청합니다.
        </div>
      </li>
      <li>
        <h3 className="text-lg font-semibold">제한 사항</h3>
        <div className="pl-1">
          최근 이미지 분석 요청은 1일 1회로 제한되며, 마지막 요청 이후 최소
          5개의 이미지가 신규 업로드 된 경우에만 가능합니다. 이 제한 사항은 이후
          조정될 수 있습니다.
        </div>
      </li>
    </ul>
  );
};

export default GeminiInfoModal;
