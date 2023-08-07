import { getUserData,makeNavElement,printNavWithServiceList } from "./module/function.js";
import { USER_DATA_KEY_SERVICE_NAME, LOCAL_STORAGE_KEY_USER_EMAIL} from "./module/constant.js";

const baseURL = window.location.origin;
let userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);

function handleNavElementClick(event){ //nav에서 특정 앱을 클릭하면 하는 작업
  //1. 기존에 active붙어있는 요소에서 active class 제거하기 & session에서 제거
  const previousActiveLi=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active");
  previousActiveLi.classList.remove(ACTIVE_CLASS);
  localStorage.removeItem(KEY_SERVICE_NAME);

  //2. click된 li tag에 active class 붙이기 & session에 클릭된 서비스이름저장
  const a=event.target.parentNode;
  const li=a.parentNode;
  li.classList.add(ACTIVE_CLASS);

  const newActiveServiceName=li.id;
  localStorage.setItem(KEY_SERVICE_NAME,newActiveServiceName);
  
  //3. click된 li의 a tag에서 serviceId꺼내서 요청보내기
  const activeContainerObj=userData.find((service)=>service[USER_DATA_KEY_SERVICE_NAME]===newActiveServiceName);
  const activeContainerList=activeContainerObj[USER_DATA_KEY_CONTAINERS];

  //4. containerList.html로 이동하기
  window.location.href="containerList.html";
}

/*
function makeNavElement(serviceName){
  const li=document.createElement("li");
  li.id=serviceName;
  const a=document.createElement("a");
  const i=document.createElement("i");
  i.classList.add(TIMS_ICONS_CLASS,ICON_CHART_PIE_CLASS);
  const p=document.createElement("p");
  p.classList.add(FONT_WEIGHT_BOLD_CLASS);
  p.innerText=serviceName;
  a.appendChild(i);
  a.appendChild(p);
  li.appendChild(a);
  return li;
}

function printNavWithServiceList(serviceList) {
  const navUl=document.querySelector(".sidebar>.sidebar-wrapper .nav");
  for (let i = 0; i < serviceList.length; i++) {
    let li=makeNavElement(serviceList[i]);
    if(i===0){
      li.classList.add("active");
      localStorage.setItem(KEY_SERVICE_NAME,li.id);
    }
    navUl.appendChild(li);
  }
  navUl.insertAdjacentElement('beforeend',navUl.querySelector("li:first-child"));
}*/

async function loadData(){
  const serviceList=[];

  const userData=await getUserData(userEmail);
  userData.forEach((service) => {
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  printNavWithServiceList(serviceList);

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
