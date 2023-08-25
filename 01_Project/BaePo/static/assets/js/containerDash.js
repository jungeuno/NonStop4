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
const CARD_CHART_CLASS="card-chart";

const ROW_CLASS="row";
const COL_1_CLASS="col-1";
const COL_4_CLASS="col-4";
const COL_6_CLASS="col-6";
const COL_10_CLASS="col-10";
const COL_12_CLASS="col-12";
const COL_LG_6_CLASS="col-lg-6";
const MR_3_CLASS="mr-3";
const MX_2_CLASS="mx-2";
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
const FIRST_ROW_CLASS="first-row";
const SECOND_ROW_CLASS="second-row";

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

async function printDash(nameSpace){
  const pods=await getPodNames();
  const pod1=pods[0];
  const pod2=pods.length===1?pods[0]:pods[1];
  const iframeSrcStringObj={
    //for pods
    pod1:{
      CreatedTime:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=179`,
      ResourceUsage:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=171`,
      NetworkTraffic:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=169`,
      MemoryStatus:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=180`,
    },
    pod2:{
      CreatedTime:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=184`,
      ResourceUsage:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=187`,
      NetworkTraffic:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=189`,
      MemoryStatus:`http://150.136.87.94:3000/d-solo/4b545447f/baepo-pods?var-namespace=${nameSpace}&var-pod1=${pod1}&var-pod2=${pod2}&panelId=190`,
    }
  };
  document.querySelector("div#pod1>div.card-header>h3").innerText=pod1;
  document.querySelector("div#pod2>div.card-header>h3").innerText=pod2;

  if(pods.length===1){
    printDashElement("pod1",iframeSrcStringObj["pod1"]);
    document.querySelector("div#pod2").setAttribute("display","none");


  } else{
    printDashElement("pod1",iframeSrcStringObj["pod1"]);
    printDashElement("pod2",iframeSrcStringObj["pod2"]);
  }
}

function startHtml(){
  loadData();
  //console.log(serviceName);
  //console.log(containerName);
  //console.log(userEmail);

  document.querySelector("#userEmail").innerText=userEmail;

  document.querySelector("h3.card-title#containerName>p").innerText=containerName;
  //document.querySelector("h3.card-title#containerName>p").classList.add(FONT_WEIGHT_BOLD_CLASS);

  let nameSpace=userEmail.replace("@","")
  nameSpace=nameSpace.replace(/\./g,"");
  nameSpace=nameSpace+"-"+serviceName;
  //console.log(nameSpace);

  const underbarIndex=containerName.indexOf("_")
  //console.log(underbarIndex);
  let deploymentName=containerName.slice(underbarIndex+1).toLowerCase();
  deploymentName=(deploymentName.length>2)?deploymentName+"end":deploymentName; 
  deploymentName=deploymentName+"-deployment";
  //console.log(deploymentName);

  const newContainerBtn = document.querySelector("#deployButton");
  newContainerBtn.addEventListener("click", function () {
    window.location.href = "deploy.html";
  });

  printDash(nameSpace,deploymentName);

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

function makeDashElement(){
  const sampleCard=document.createElement("div"); //
  sampleCard.classList.add(CARD_CLASS,COL_6_CLASS,MR_3_CLASS);
  sampleCard.style=PINK_BORDER_STYLE;
  const cardHeader=document.createElement("div");
  cardHeader.classList.add(CARD_HEADER_CLASS);
  const h3=document.createElement("h3");
  cardHeader.appendChild(h3);
  const cardBody=document.createElement("div");
  cardBody.classList.add(CARD_BODY_CLASS);
  const iframe=document.createElement("iframe");
  iframe.width="97%";
  iframe.height="100%";
  iframe.frameBorder="0";
  cardBody.appendChild(iframe);
  sampleCard.appendChild(cardHeader);
  sampleCard.appendChild(cardBody);
  return sampleCard;
}

/*===========================================================================================================================*/ 

function printDashElement(cardName,srcObj){
  console.log("makeDashElement Func Start..");
  console.log(srcObj);
  const targetCard=document.querySelector(`div#${cardName}`)
  const targetRowArr=[
    targetCard.querySelector(`div.${FIRST_ROW_CLASS}`),
    targetCard.querySelector(`div.${SECOND_ROW_CLASS}`),
  ];
  //making sample

  let cnt=0;
  let row=0;
  Object.keys(srcObj).forEach((key)=>{
    const data=makeDashElement();
    data.querySelector("h3").innerText=key;
    data.querySelector("iframe").src=srcObj[key];
    console.log("targetnode");
    console.log(targetRowArr[row]);
    targetRowArr[row].appendChild(data);
    cnt++;
    if(cnt%2==0)row++;
  });
}

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

async function getPodNames(){
    const requestURI = `/services/${serviceName}/containers/${containerName}/pods`;
    const url = BASE_URL + requestURI;
    const objKey="podNames";
    const options = {
      method: "GET",
    };
    try{
      const response=await fetch(url,options);
      if(response.ok){
        const jsonObj=await response.json();
        console.log(jsonObj);
        console.log(jsonObj[objKey]);
        return jsonObj[objKey];
      }
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