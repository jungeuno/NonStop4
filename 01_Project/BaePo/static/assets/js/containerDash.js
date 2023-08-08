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

/* main function ==========================================================*/ 

function cleanNodeByQuerySelector(querySelectorString){
  const parentNode=document.querySelector(querySelectorString);
  parentNode.replaceChildren();
}

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

function printNavWithServiceList(serviceList) {
    const navUl=document.querySelector(".sidebar>.sidebar-wrapper .nav");
    let savedServiceName=localStorage.getItem(USER_DATA_KEY_SERVICE_NAME);
    for (let i = 0; i < serviceList.length; i++) {
        let li=makeNavElement(serviceList[i]);
        if((savedServiceName===li.id)||(i===0)){ // (다른 페이지에서 사이드바 클릭해서 containerList로 넘어오는 경우) || (로그인으로 넘어오는 경우)
            li.classList.add("active");
            localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,li.id);
        }
        navUl.appendChild(li);
    }
    navUl.insertAdjacentElement('beforeend',navUl.querySelector("li:first-child"));
}

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

}

$(document).ready(function () {
    $().ready(startHtml());
});

/* function ==========================================================*/ 