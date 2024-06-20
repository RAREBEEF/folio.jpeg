const useDateDiffNow = () => {
  const dateDiffNow = (ms: number) => {
    const targetDate = new Date(ms);
    const now = new Date();

    let years = now.getFullYear() - targetDate.getFullYear();
    let months = now.getMonth() - targetDate.getMonth();
    let days = now.getDate() - targetDate.getDate();
    let hours = now.getHours() - targetDate.getHours();
    let minutes = now.getMinutes() - targetDate.getMinutes();
    let seconds = now.getSeconds() - targetDate.getSeconds();
    let diffSummary;

    if (seconds < 0) {
      minutes -= 1;
      seconds += 60;
    }

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    if (hours < 0) {
      days -= 1;
      hours += 24;
    }

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) {
      diffSummary = `${years}년 전`;
    } else if (months > 0) {
      diffSummary = `${months}달 전`;
    } else if (days > 0) {
      diffSummary = `${days}일 전`;
    } else if (hours > 0) {
      diffSummary = `${hours}시간 전`;
    } else if (minutes > 0) {
      diffSummary = `${minutes}분 전`;
    } else if (seconds > 0) {
      diffSummary = `${seconds}초 전`;
    } else {
      diffSummary = "방금 전";
    }

    return { years, months, days, hours, minutes, seconds, diffSummary };
  };

  return dateDiffNow;
};

export default useDateDiffNow;
