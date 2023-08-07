import {
  LOCAL_STORAGE_KEY_USER_EMAIL,
  USER_DATA_KEY_SERVICE_NAME,
  ACTIVE_CLASS,
  LOCAL_STORAGE_KEY_SERVICE_NAME,
} from "./module/constant.js";
import {
  getUserData,
  printNavWithServiceList
} from "./module/function.js";

const baseURL = window.location.origin;
let userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);

function handleNavElementClick(event){ //nav에서 특정 앱을 클릭하면 하는 작업
  //1. 기존에 active붙어있는 요소에서 active class 제거하기 & session에서 제거
  const previousActiveLi=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active");
  previousActiveLi.classList.remove(ACTIVE_CLASS);
  localStorage.removeItem(LOCAL_STORAGE_KEY_SERVICE_NAME);

  //2. click된 li tag에 active class 붙이기 & session에 클릭된 서비스이름저장
  const a=event.target.parentNode;
  const li=a.parentNode;
  li.classList.add(ACTIVE_CLASS);

  const newActiveServiceName=li.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,newActiveServiceName);

  //4. containerList.html로 이동하기
  window.location.href="containerList.html";
}


async function loadData(){
  const serviceList=[];

  //1. 서버에서 로그인된 유저의 정보 받아오기
  const userData=await getUserData(userEmail);
  
  //2. 받아온 정보에서 서비스 이름만 빼서 리스트 만들고, 화면 구성하기
  userData.forEach((service) => {
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  printNavWithServiceList(serviceList);

  //3. 2에서 구성한 navbar 요소에 핸들러 추가하기
  const navElements=document.querySelectorAll(".sidebar>.sidebar-wrapper .nav>li>a");
  for (let i=0;i<(navElements.length)-1;i++){
    navElements[i].addEventListener("click",handleNavElementClick); 
  }
}

$(document).ready(function () {
  $().ready(function () {
    loadData();

    $("#frontEnv").bsMultiSelect({
      useCssPatch: true,
      cssPatch: {
        choices: {
          columnCount: "4",
        },
      },
    }); //multi select plugin

    $("#dbEnv").bsMultiSelect({
      useCssPatch: true,
      cssPatch: {
        choices: {
          columnCount: "4",
        },
      },
    }); //multi select plugin

    $("#backEnv").bsMultiSelect({
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
