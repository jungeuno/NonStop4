/* Constant ==========================================================*/ 
//bootstrap className
export const TIMS_ICONS_CLASS="tim-icons";
export const ICON_CHART_PIE_36_CLASS="icon-chart-pie-36";
export const ICON_TRIANGLE_RIGHT_17_CLASS="icon-triangle-right-17";
export const ICON_BUTTON_PAUSE_CLASS="icon-button-pause";
export const ICON_TV_2_CLASS="icon-tv-2";
export const ICON_SETTING_GEAR_63_CLASS="icon-settings-gear-63";

export const CARD_CLASS="card";
export const CARD_BODY_CLASS="card-body";
export const CARD_HEADER_CLASS="card-header";
export const CARD_GROUP_CLASS="card-group";
export const CARD_FOOTER_CLASS="card-footer";
export const CARD_TITLE_CLASS="card-title";

export const ROW_CLASS="row";
export const COL_1_CLASS="col-1";
export const COL_4_CLASS="col-4";
export const COL_10_CLASS="col-10";
export const COL_12_CLASS="col-12";
export const MR_3_CLASS="mr-3";
export const PR_0_CLASS="pr-0";

export const BADGE_CLASS="badge";
export const BADGE_PILL_CLASS="badge-pill";
export const BADGE_INFO_CLASS="badge-info";
export const BADGE_DANGER_CLASS="badge-danger";

export const BTN_CLASS="btn";
export const BTN_PRIMARY_CLASS="btn-primary";
export const BTN_LINK_CLASS="btn-link";

export const DISABLED_CLASS="disabled";
export const FONT_WEIGHT_BOLD_CLASS="font-weight-bold";
export const ACTIVE_CLASS="active";
export const D_INLINE_CLASS="d-inline";
export const TEXT_CENTER_CLASS="text-center";
export const TEXT_RIGHT_CLASS="text-right";

//for localStorage key
export const LOCAL_STORAGE_KEY_USER_EMAIL="user-email";
export const LOCAL_STORAGE_KEY_SERVICE_NAME="service-name";
export const LOCAL_STORAGE_KEY_CONTAINER_NAME="container-name";

//서버에서 받아오는 userData객체의 키값
export const USER_DATA_KEY_SERVICE_NAME="Service Name";
export const USER_DATA_KEY_CREATING_DATE="Creating Date";
export const USER_DATA_KEY_CONTAINERS="Containers";
export const CONTAINER_KEY_NAME="name";
export const CONTAINER_KEY_ENV="env";
export const CONTAINER_KEY_STATE="state";

//custom style for containerCardElement
export const PINK_BORDER_STYLE="border:1px solid #e44cc4";

//custom class name 
export const MONITORING_BUTTON_CLASS="monitoring-btn";
export const MANAGING_BUTTON_CLASS="managing-btn";

//baseURL used in fetch api
export const BASE_URL=window.location.origin;

const userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);
const serviceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);

const SERVICE_EDIT_BUTTONS_CLASS="service-edit-buttons"; //edit, delete에 같은 이벤트 핸들러 걸어주기 위해서 custom class부여함

/* main function ==========================================================*/ 

async function loadData(){
  const serviceList=[];

  const userData=await getUserData(userEmail);
  userData.forEach((service) => {
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  printNavWithServiceList(serviceList);

}

const formElemnt=document.querySelector("form#editDeployForm");

async function handleServiceEditButtonClick(event){  
    //button의 value : {UPDATE / DELETE} 에 따라서 서비스를 업데이트하거나 삭제하는 요청을 보냄
    const requestURI=`/services/${serviceName}`
    const url=baseURL+requestURI;
    const method=event.target.value;
    const options={
        method:{method}
    }
    console.log(`handleServiceEditButtonClick : ${options}`);
    try{
        const response=await fetch(url,options);
        if(response.ok){
            location.href="containerList.html";
        }
        else{
            console.log(`${url}로 ${options.method}요청 서버의 비정상 응답 : [${response.status}] ${response.statusText}`);
        }
    } catch(error){
        console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
    }
}

$(document).ready(function() {
    $().ready(function() {
        const cardTitle=document.querySelector("div.content").querySelector("h3.service-name");
        cardTitle.innerText=serviceName;
        loadData();

        const serviceEditButtons=document.querySelectorAll(`.${SERVICE_EDIT_BUTTONS_CLASS}`);
        serviceEditButtons.forEach((serviceEditButton)=>serviceEditButton.addEventListener(handleServiceEditButtonClick));

        $('#frontEnv').bsMultiSelect({
            useCssPatch:true,
            cssPatch:{
                choices:{
                    columnCount:'4'
                }
            },
        }); //multi select plugin

        $('#dbEnv').bsMultiSelect({
            useCssPatch:true,
            cssPatch:{
                choices:{
                    columnCount:'4'
                }
            },
        }); //multi select plugin

        $('#backEnv').bsMultiSelect({
            useCssPatch:true,
            cssPatch:{
                choices:{
                    columnCount:'4'
                }
            },
        }); //multi select plugin

        $('#pubCountry').bsMultiSelect({
            useCssPatch:true,
            cssPatch:{
                choices:{
                    columnCount:'2'
                }
            },
        }); //multi select plugin
    });
});

/* function ==========================================================*/ 

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
            localStorage.setItem(USER_DATA_KEY_SERVICE_NAME,li.id);
        }
        navUl.appendChild(li);
    }
    navUl.insertAdjacentElement('beforeend',navUl.querySelector("li:first-child"));
}