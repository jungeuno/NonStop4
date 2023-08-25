//baseURL used in fetch api
const BASE_URL = window.location.origin;

/*===========================================================================================================================*/
/* main function ==========================================================================================================*/
/*===========================================================================================================================*/

window.TrackJS &&
  TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free",
  });

function startHTML() {
  const logoutButton = document.querySelector("a#logoutButton");
  const withdrawalModalButton = document.querySelector("a#withdrawalModalButton");

  logoutButton.addEventListener("click", logout);
  withdrawalModalButton.addEventListener("click", ()=>{
    $("#withdrawalModal").modal("show");
    const withdrawalButton=document.querySelector("button#withdrawalButton");
    withdrawalButton.addEventListener("click",withdrawal);
  });
}

$(document).ready(function () {
  $().ready(startHTML);
});

/*===========================================================================================================================*/
/* function ==========================================================================================================*/
/*===========================================================================================================================*/

async function logout() {
  console.log("logtout Func Starts...");
  localStorage.clear();
  const requestURI = "/logout";
  const url = BASE_URL + requestURI;
  const options = {
    method: "POST",
  };
  try {
    const response = await fetch(url, options);
    if (response.ok) window.location = "/";
  } catch (error) {
    console.log(
      `${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`
    );
    console.log(error);
  }
}

/*===========================================================================================================================*/

async function withdrawal() {
  localStorage.clear();
  const requestURI = "/withdrawal";
  const url = BASE_URL + requestURI;
  const options = {
    method: "POST",
  };
  try {
    const response = await fetch(url, options);
    if (response.ok) window.location = "/";
  } catch (error) {
    console.log(
      `${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`
    );
    console.log(error);
  }
}

function withdrawalModal() {
  $("#withdrawalModal").modal("show");
}
