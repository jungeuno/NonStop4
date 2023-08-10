/* Constant ==========================================================*/ 
//bootstrap className
const TIMS_ICONS_CLASS="tim-icons";
const ICON_CHART_PIE_36_CLASS="icon-chart-pie-36";
const ICON_TRIANGLE_RIGHT_17_CLASS="icon-triangle-right-17";
const ICON_BUTTON_PAUSE_CLASS="icon-button-pause";
const ICON_TV_2_CLASS="icon-tv-2";
const ICON_SETTING_GEAR_63_CLASS="icon-settings-gear-63";

const CARD_CLASS="card";
const CARD_BODY_CLASS="card-body";
const CARD_HEADER_CLASS="card-header";
const CARD_GROUP_CLASS="card-group";
const CARD_FOOTER_CLASS="card-footer";
const CARD_TITLE_CLASS="card-title";

const ROW_CLASS="row";
const COL_1_CLASS="col-1";
const COL_4_CLASS="col-4";
const COL_10_CLASS="col-10";
const COL_12_CLASS="col-12";
const MR_3_CLASS="mr-3";
const PR_0_CLASS="pr-0";

const BADGE_CLASS="badge";
const BADGE_PILL_CLASS="badge-pill";
const BADGE_INFO_CLASS="badge-info";
const BADGE_DANGER_CLASS="badge-danger";

const BTN_CLASS="btn";
const BTN_PRIMARY_CLASS="btn-primary";
const BTN_LINK_CLASS="btn-link";

const DISABLED_CLASS="disabled";
const FONT_WEIGHT_BOLD_CLASS="font-weight-bold";
const ACTIVE_CLASS="active";
const D_INLINE_CLASS="d-inline";
const TEXT_CENTER_CLASS="text-center";
const TEXT_RIGHT_CLASS="text-right";

//for localStorage key
const LOCAL_STORAGE_KEY_USER_EMAIL="user-email";
const LOCAL_STORAGE_KEY_SERVICE_NAME="service-name";
const LOCAL_STORAGE_KEY_CONTAINER_NAME="container-name";

//서버에서 받아오는 userData객체의 키값
const USER_DATA_KEY_SERVICE_NAME="Service Name";
const USER_DATA_KEY_CREATING_DATE="Creating Date";
const USER_DATA_KEY_CONTAINERS="Containers";
const CONTAINER_KEY_NAME="name";
const CONTAINER_KEY_ENV="env";
const CONTAINER_KEY_STATE="state";

//custom style for containerCardElement
const PINK_BORDER_STYLE="border:1px solid #e44cc4";

//custom class name 
const MONITORING_BUTTON_CLASS="monitoring-btn";
const MANAGING_BUTTON_CLASS="managing-btn";

//baseURL used in fetch api
const BASE_URL=window.location.origin;

/*=========================================================================================================================*/ 
/* main function ==========================================================================================================*/ 
/*=========================================================================================================================*/ 
const userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);
const serviceName = localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
const containerName = localStorage.getItem(LOCAL_STORAGE_KEY_CONTAINER_NAME);


window.TrackJS &&
TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free",
});

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

function startHtml(){
  loadData();
  //console.log(serviceName);
  //console.log(containerName);
  //console.log(userEmail);

  document.querySelector("#userEmail").innerText=userEmail;

  document.querySelector("h4.card-title#containerName>p").innerText=containerName;

  let nameSpace=userEmail.replace("@","")
  nameSpace=nameSpace.replace(/\./g,"");
  nameSpace=nameSpace+"-"+serviceName;
  //console.log(nameSpace);

  const underbarIndex=containerName.indexOf("_")
  //console.log(underbarIndex);
  let deploymentName=containerName.slice(underbarIndex+1).toLowerCase();
  deploymentName=(deploymentName.length>2)?deploymentName+"end":deploymentName; 
  deploymentName=deploymentName+"-deployment";
  console.log(deploymentName);

  const iframeSrcStringObj={
    "requestDurationPercentiles":`http://150.136.87.94:3000/d-solo/e424dc61-1f8e-4765-ab32-287ef63ab35d/baepo?orgId=1&var-Node=All&var-Namespace=${nameSpace}&var-Deployment=${deploymentName}&from=1691680244817&to=1691681144817&panelId=46`,
    "requestPerMinutes":`http://150.136.87.94:3000/d-solo/e424dc61-1f8e-4765-ab32-287ef63ab35d/baepo?orgId=1&var-Node=All&var-Namespace=${nameSpace}&var-Deployment=${deploymentName}&from=1691680436298&to=1691681336298&panelId=44`,
    "cpuUsage":`http://150.136.87.94:3000/d-solo/e424dc61-1f8e-4765-ab32-287ef63ab35d/baepo?orgId=1&var-Node=All&var-Namespace=${nameSpace}&var-Deployment=${deploymentName}&from=1691680504234&to=1691681404234&panelId=17`,
    "memoryUsage":`http://150.136.87.94:3000/d-solo/e424dc61-1f8e-4765-ab32-287ef63ab35d/baepo?orgId=1&var-Node=All&var-Namespace=${nameSpace}&var-Deployment=${deploymentName}&from=1691680558801&to=1691681458801&panelId=25`,
  };

  Object.keys(iframeSrcStringObj).forEach((key)=>{
    const target=document.querySelector(`div.card#${key} iframe`);
    target.src=iframeSrcStringObj[key]
    //푸시용 주석
  });

  const logoutButton=document.querySelector("#logoutButton");
  logoutButton.addEventListener("click",logout);

}

$(document).ready(function () {
    $().ready(startHtml());
});

/*===========================================================================================================================*/ 
/* specific function ==========================================================================================================*/ 
/*===========================================================================================================================*/ 


/*===========================================================================================================================*/ 
/* common function ==========================================================================================================*/ 
/*===========================================================================================================================*/ 

async function logout(){
  //console.log("logtout Func Starts...");
  localStorage.clear();
  const requestURI = "/logout";
  const url = BASE_URL + requestURI;
  const options = {
    method: "POST",
  };
  try{
    const response=await fetch(url,options);
    if(response.ok) window.location="/"
  } catch(error){
    console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
    console.log(error);
  }
}

/*====================================================================================================================*/ 

function cleanNodeByQuerySelector(querySelectorString){
  const parentNode=document.querySelector(querySelectorString);
  parentNode.replaceChildren();
}

/*====================================================================================================================*/ 

async function getUserData(userEmail){
    console.log("getUserData Func Start...");
    const requestURI = "/services";
    const url = BASE_URL + requestURI;
    const options = {
      method: "GET",
    };
    try{
      const response=await fetch(url,options);
      const userData=await response.json();
      return userData[userEmail];
  
    } catch(error){
      console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
    }
}

/*====================================================================================================================*/ 

function makeNavElement(serviceName,clickEventHandler){
    const li=document.createElement("li");
    li.id=serviceName;
    const a=document.createElement("a");
    const i=document.createElement("i");
    i.classList.add(TIMS_ICONS_CLASS,ICON_CHART_PIE_36_CLASS);
    const p=document.createElement("p");
    p.classList.add(FONT_WEIGHT_BOLD_CLASS);
    p.innerText=serviceName;
    a.appendChild(i);
    a.appendChild(p);
    li.appendChild(a);
    return li;
}

/*====================================================================================================================*/ 

function handleNavElementClick(event,userData){ //nav에서 특정 앱을 클릭하면 하는 작업
  //active붙어있는 애한테서 active class 제거하기
  const previousActiveLi=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active");
  previousActiveLi.classList.remove(ACTIVE_CLASS);

  //2. click된 li tag에 active class 붙이기 event.target : p tage
  const a=event.target.parentNode;
  const li=a.parentNode;
  li.classList.add(ACTIVE_CLASS);
  
  //3. activeTag의 값을 세션에 저장하고 contiainerList.html로 이동하기
  const newActiveServiceName=li.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,newActiveServiceName);

  window.location.href="containerList.html";
}

/*====================================================================================================================*/ 

function printNavWithServiceList(serviceList) { //editDeploy, deploy,containerDash만 동일 containerList.js의 동일함수랑 작동 방식 다름
    const navUl=document.querySelector(".sidebar>.sidebar-wrapper .nav");
    let savedServiceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
    for (let i = 0; i < serviceList.length; i++) {
        let li=makeNavElement(serviceList[i]);
        if(savedServiceName===li.id){ //이부분이 containerList.js의 동일한 이름의 함수랑 다른 부분
            li.classList.add("active");
            localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,li.id);
        }
        navUl.appendChild(li);
    }
    navUl.insertAdjacentElement('beforeend',navUl.querySelector("li:first-child"));
}