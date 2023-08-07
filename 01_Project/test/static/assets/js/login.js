window.TrackJS &&
  TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free",
  });
function saveUserInfo() {
  //save user-id
}

async function login(baseURL) {
  console.log(`login func 진입`);
  const requestURI = "/login";
  const url = baseURL + requestURI;
  try {
    const response = await fetch(url, {
      method: "GET",
    });

    // 로그인이 완료되면 containerList.html로 페이지 전환
    if (response.ok) {
      window.location.href = "/containerList.html";
    }
  } catch (error) {
    console.log(`login 함수에서 에러 발생 :\n${error}`);
  }
}

$(document).ready(function () {
  $().ready(function () {
    const baseURL = window.location.origin;
    const loginButton = document.querySelector("#login-button");

    // 버튼 클릭 이벤트 정의
    loginButton.addEventListener("click", function () {
      // 페이지 전환을 위해 /login 경로로 이동
      window.location.href = baseURL + "/login";
    });
  });
});
