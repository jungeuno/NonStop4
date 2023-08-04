const baseURL = window.location.origin;
let userEmail = localStorage.getItem("user-email");
if (userEmail === null) {
  userEmail = "teamnonstop00@gmail.com";
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const formElement = document.querySelector("form#deployForm");
  const formData = new FormData(formElement);

  //   폼 데이터를 확인하는 코드
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  const requestURI = `/users/${userEmail}/services`;
  const url = baseURL + requestURI;
  const options = {
    method: "POST",
    body: formData,
  };
  try {
    const response = await fetch(url, options);
    // 서버로부터의 응답 처리 로직
    // console.log("서버 응답:", response);
    if (response.ok) {
      console.log("서버 응답:", response);
    }
  } catch (error) {
    console.log("에러 발생:", error);
  }
}

$(document).ready(function () {
  $().ready(function () {
    $("form").on("submit", handleFormSubmit);

    $("#devEnv").bsMultiSelect({
      useCssPatch: true,
      cssPatch: {
        choices: {
          columnCount: "4",
        },
      },
    }); //multi select plugin

    $("#pubCountry").bsMultiSelect({
      useCssPatch: true,
      cssPatch: {
        choices: {
          columnCount: "2",
        },
      },
    }); //multi select plugin
  });
});
