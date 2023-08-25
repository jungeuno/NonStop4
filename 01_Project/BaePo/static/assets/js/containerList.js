
/* Constant ==========================================================*/ 
//bootstrap className
const TIMS_ICONS_CLASS="tim-icons";
const ICON_CHART_PIE_36_CLASS="icon-chart-pie-36";
const ICON_TRIANGLE_RIGHT_17_CLASS="icon-triangle-right-17";
const ICON_BUTTON_PAUSE_CLASS="icon-button-pause";
const ICON_TV_2_CLASS="icon-tv-2";
const ICON_SETTING_GEAR_63_CLASS="icon-settings-gear-63";
const ICON_REFRESH_02_CLASS="icon-refresh-02";

const CARD_CLASS="card";
const CARD_BODY_CLASS="card-body";
const CARD_HEADER_CLASS="card-header";
const CARD_GROUP_CLASS="card-group";
const CARD_FOOTER_CLASS="card-footer";
const CARD_TITLE_CLASS="card-title";

const ROW_CLASS="row";
const COL_1_CLASS="col-1";
const COL_2_CLASS="col-2";
const COL_3_CLASS="col-3";
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
const BTN_INFO_CLASS="btn-info";
const BTN_SUCCESS_CLASS="btn-success";

const DISABLED_CLASS="disabled";
const FONT_WEIGHT_BOLD_CLASS="font-weight-bold";
const ACTIVE_CLASS="active";
const D_INLINE_CLASS="d-inline";
const TEXT_CENTER_CLASS="text-center";
const TEXT_RIGHT_CLASS="text-right";
const TEXT_LEFT_CLASS="text-left";

//for localStorage key
const LOCAL_STORAGE_KEY_USER_EMAIL="user-email";
const LOCAL_STORAGE_KEY_SERVICE_NAME="service-name";
const LOCAL_STORAGE_KEY_CONTAINER_NAME="container-name";

//서버에서 받아오는 userData객체의 키값
const USER_DATA_KEY_SERVICE_NAME="Service Name";
const USER_DATA_KEY_CREATING_DATE="Creating Date";
const USER_DATA_KEY_CONTAINERS="Containers";
const USER_DATA_SERVICE_IP="Service IP";
const CONTAINER_KEY_NAME="name";
const CONTAINER_KEY_ENV="env";
const CONTAINER_KEY_STATE="state";

//custom style for containerCardElement
const PINK_BORDER_STYLE="border:1px solid #e44cc4";
const RUN_BUTTON_CLASS="run-button";
const PAUSE_BUTTON_CLASS="pause-button";

//custom class name 
const MONITORING_BUTTON_CLASS="monitoring-btn";
const MANAGING_BUTTON_CLASS="managing-btn";
const STATE_BADGE_CLASS="state-badge";

//baseURL used in fetch api
const BASE_URL=window.location.origin;

/*=========================================================================================================================*/ 
/* main function ==========================================================================================================*/ 
/*=========================================================================================================================*/ 

async function loadData(userEmail){
  console.log("(loadData)loadData Func Start...");  
  const serviceList=[];

  //1. 서버에 userData요청, 현재 로그인된 유저의 정보 객체를 반환
  const userData=await getUserData(userEmail); 
  console.log(userData);
  console.log("(loadData)getUserData Func End...");

  //2. serviceList에 현재 로그인된 유저의 서비스 리스트를 추가함
  userData.forEach((service) => { 
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  console.log("(loadData)making service lists...");
  console.log(serviceList);

  //3. 서비스 리스트 이용해서 navbar 내용 넣기
  printNavWithServiceList(serviceList); 
  console.log("(loadData)print navbar is completed");
  
  //4. 3에서 만든 navbar의 요소들에 이벤트 핸들러 추가
  console.log("(loadData)Adding navbar eventhandler");
  const navElements=document.querySelectorAll(".sidebar>.sidebar-wrapper .nav>li>a");
  for (let i=0;i<(navElements.length)-1;i++){
    navElements[i].addEventListener("click",(event)=>handleNavElementClick(event,userData)); 
  }

  //5. navbar 요소 만들면서 active로 지정해준 현재 보고 있는 서비스 명 가져오기
  console.log("(loadData)printing active nav id");
  const activeServiceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME) 
  console.log(activeServiceName);

  //6. 서비스 명으로 userData에서 서비스 객체 꺼내기 -> ip, containerList 꺼내기
  console.log("(loadData)lets find active service object for ip, and containerList");
  const activeServiceObj=userData.find((service)=>service[USER_DATA_KEY_SERVICE_NAME]===activeServiceName);
  console.log("(loadData)active service object");
  console.log(activeServiceObj);
  const activeServiceIP=activeServiceObj[USER_DATA_SERVICE_IP];
  const activeContainerList=activeServiceObj[USER_DATA_KEY_CONTAINERS];

  //6. card Title 만들기 : 이름 + 수정하기 버튼 + 핸들러 추가
  printCardTitle(activeServiceName,activeServiceIP);
  console.log("(loadData)printing card title is compelete");

  //7. 현재 보고 있는 서비스의 컨테이너 리스트를 꺼내서 화면 구성하기
  printContainerList(activeContainerList);
  console.log("(loadData)printing container list is compelete");

}

function startHtml() { //데이터와 무관하게 이벤트 핸들러 구성하는 작업
  console.log("startHtml Func Start...");

  //login한 user email session에 저장
  let userEmail=localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);
  if(!userEmail){ //비어있으면 : 로그인 페이지로 접근한 경우
    userEmail=document.querySelector("p#userEmail").innerText;
  }
  //console.log(userEmail);
  localStorage.setItem(LOCAL_STORAGE_KEY_USER_EMAIL,userEmail);
  //console.log(localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL));

  console.log(localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME));

  loadData(userEmail);

  const newContainerBtn = document.querySelector("#deployButton");
  newContainerBtn.addEventListener("click", function () {
    window.location.href = "deploy.html";
  });

  const logoutButton=document.querySelector("#logoutButton");
  logoutButton.addEventListener("click",logout);

}

$(document).ready(() => $().ready(startHtml));


/*====================================================================================================================*/ 
/* function ==========================================================================================================*/ 
/*====================================================================================================================*/ 

async function logout(){
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
  const requestURI = "/services";
  const url = BASE_URL + requestURI;
  const options = {
    method: "GET",
  };
  try{
    const response=await fetch(url,options);
    if(response.ok){
      const userData=await response.json();
      return userData[userEmail];
    } else{
      console.log(`${url}로 ${options.method}요청 비정상 응답 : [${response.status}] ${response.statusText}`);
    }

  } catch(error){
    console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
    console.log(error);
  }
}

/*====================================================================================================================*/ 

function handleNavElementClick(event,userData){ //nav에서 특정 앱을 클릭하면 하는 작업
  //active붙어있는 애한테서 active class 제거하기
  const previousActiveLi=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active");
  previousActiveLi.classList.remove(ACTIVE_CLASS);
  localStorage.removeItem(LOCAL_STORAGE_KEY_SERVICE_NAME);

  //2. click된 li tag에 active class 붙이기 event.target : p tage
  const a=event.target.parentNode;
  const li=a.parentNode;
  li.classList.add(ACTIVE_CLASS);
  
  //3. click된 li의 a tag에서 serviceId꺼내서 필요한 정보들 꺼내기 : 컨테이너 리스트, 서비스 ip
  const newActiveServiceName=li.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,newActiveServiceName); //active service name 저장

  const newActiveServiceObj=userData.find((service)=>service[USER_DATA_KEY_SERVICE_NAME]===newActiveServiceName); //new active service 객체 꺼내기
  const newActiveServiceIP=newActiveServiceObj[USER_DATA_SERVICE_IP];
  const newActiveContainerList=newActiveServiceObj[USER_DATA_KEY_CONTAINERS];

  //4. card 비우기
  const cardQuerySelectorString="div.content>div.row>div.col-md-12>div#card";
  cleanNodeByQuerySelector(cardQuerySelectorString);

  //5. card header 넣기
  printCardTitle(newActiveServiceName,newActiveServiceIP);

  //6. card group 클릭된 서비스 관련 내용으로 넣기
  printContainerList(newActiveContainerList);
}

/*====================================================================================================================*/ 

function makeNavElement(serviceName){
  //console.log("makeNavElement Func Starts...");
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

function printNavWithServiceList(serviceList) {
  console.log("printNavWithServicelist Func Starts...");
    const navUl=document.querySelector(".sidebar>.sidebar-wrapper .nav");
    let savedServiceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
    let activeLiIndex=0;
    for (let i = 0; i < serviceList.length; i++) {
        let li=makeNavElement(serviceList[i]);
        if(savedServiceName===li.id) activeLiIndex=i+1;
        navUl.appendChild(li);
    }
    navUl.insertAdjacentElement('beforeend',navUl.querySelector("li:first-child"));

    if(!activeLiIndex) activeLiIndex=1;
    const activeLi=navUl.querySelector(`li:nth-child(${activeLiIndex})`);
    console.log(activeLi);
    activeLi.classList.add(ACTIVE_CLASS);
    localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,activeLi.id);

}

/*====================================================================================================================*/ 

function printContainerList(containerList){
  //console.log("printContainerList Func Starts...");
  const card=document.querySelector("div.content>div.row>div.col-md-12>div#card");

  //container Element card를 담는 틀 만들기
  const cardBodyDiv=document.createElement("div");
  cardBodyDiv.classList.add(CARD_BODY_CLASS);
  cardBodyDiv.id="containerListCard";
  const rowDiv=document.createElement("div");
  rowDiv.classList.add(ROW_CLASS);
  const cardGroupDiv=document.createElement("div");
  cardGroupDiv.classList.add(CARD_GROUP_CLASS,COL_12_CLASS);

  //틀에 요소 붙이기
  for (let i = 0; i < containerList.length; i++) {
    let container=makeContainerElement(containerList[i]);
    cardGroupDiv.appendChild(container);
  }
  rowDiv.appendChild(cardGroupDiv);
  cardBodyDiv.appendChild(rowDiv);
  card.appendChild(cardBodyDiv);
}

/*====================================================================================================================*/ 

async function handleContainerRunButtonClick(event){ //container state stop -> run변경
  const cardDiv=event.target.parentNode.parentNode.parentNode;
  const serviceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
  const containerName=cardDiv.id;
  const work={"work":"run"}
  const requestURI = `/services/${serviceName}/containers/${containerName}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body : JSON.stringify(work),
  };
  try{
    const response=await fetch(url,options);
    if(response.ok){
      const containerCardDiv=event.target.parentNode.parentNode.parentNode;
      containerCardDiv.querySelector("div.card-header button>i").click();
    } else {
      console.log(`${url}로 ${options.method}요청 비정상 응답 : [${response.status}] ${response.statusText}`);
    }
  } catch(error){
    console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
  }
}

/*====================================================================================================================*/ 

async function handleContainerPauseButtonClick(event){ //container state stop -> run변경
  const cardDiv=event.target.parentNode.parentNode.parentNode;
  const serviceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
  const containerName=cardDiv.id;
  const work={"work":"pause"}
  const requestURI = `/services/${serviceName}/containers/${containerName}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body : JSON.stringify(work),
  };
  try{
    const response=await fetch(url,options);
    if(response.ok){
      const containerCardDiv=event.target.parentNode.parentNode.parentNode;
      containerCardDiv.querySelector("div.card-header button>i").click();
    } else {
      console.log(`${url}로 ${options.method}요청 비정상 응답 : [${response.status}] ${response.statusText}`);
    }
  } catch(error){
    console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
  }
}

/*====================================================================================================================*/ 

async function handleContainerRefreshButtonClick(event){ //container state stop -> run변경
  console.log("refresh butto clicked");

  const cardDiv=event.target.parentNode.parentNode.parentNode;
  const stateBadge=cardDiv.querySelector("span");
  const runButton=cardDiv.querySelector(`button.${RUN_BUTTON_CLASS}`);
  const pauseButton=cardDiv.querySelector(`button.${PAUSE_BUTTON_CLASS}`);

  const serviceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
  const containerName=cardDiv.id;

  const requestURI = `/services/${serviceName}/containers/${containerName}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "GET",
  };
  try{
    const response=await fetch(url,options);
    if(response.ok){
      const obj=await response.json()
      let resultState=null;
      const states=obj[CONTAINER_KEY_STATE];
      states.forEach((state)=>resultState=state);

      if(resultState==="Running"){
        stateBadge.classList.remove(BADGE_DANGER_CLASS);
        stateBadge.classList.add(BADGE_INFO_CLASS);
        runButton.classList.add(DISABLED_CLASS);
        pauseButton.classList.remove(DISABLED_CLASS);
      } else {
        stateBadge.classList.remove(BADGE_INFO_CLASS);
        stateBadge.classList.add(BADGE_DANGER_CLASS);
        runButton.classList.remove(DISABLED_CLASS);
        pauseButton.classList.add(DISABLED_CLASS);

      }
      

      //window.location.reload();
    } else {
      console.log(`${url}로 ${options.method}요청 비정상 응답 : [${response.status}] ${response.statusText}`);
    }
  } catch(error){
    console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
  }
}
/*====================================================================================================================*/ 

function handleContainerMonitoringButtonClick(event){ //containerDash.html로 이동 userid, serviceid, containerid가지고
  const cardDiv=event.target.parentNode.parentNode.parentNode;
  const clickedContainerName=cardDiv.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_CONTAINER_NAME,clickedContainerName)
  window.location.href="containerDash.html";
}

/*====================================================================================================================*/ 

function makeContainerElement(containerInfo){ //container data받아서 html에 표시해줄 요소 생성
  //console.log("makeContainerElement Func start...");
  //card 틀 div만들기
  const cardDiv=document.createElement("div");
  cardDiv.classList.add(CARD_CLASS,COL_4_CLASS,MR_3_CLASS);
  cardDiv.style=PINK_BORDER_STYLE;
  cardDiv.id=containerInfo[CONTAINER_KEY_NAME];
  //console.log(containerInfo[CONTAINER_KEY_NAME]);

  //cardHeader div만들기 : state + env
  const cardHeaderDiv=document.createElement("div");
  cardHeaderDiv.classList.add(CARD_HEADER_CLASS);
  const badgeSpan=document.createElement("span");
  badgeSpan.classList.add(BADGE_CLASS,BADGE_PILL_CLASS,COL_1_CLASS,STATE_BADGE_CLASS);
  badgeSpan.innerText=" ";
  const refreshButton=document.createElement("button");
  refreshButton.classList.add(BTN_CLASS,COL_10_CLASS,TEXT_RIGHT_CLASS,PR_0_CLASS,BTN_PRIMARY_CLASS,BTN_LINK_CLASS);
  refreshButton.addEventListener("click",handleContainerRefreshButtonClick);
  const refreshI=document.createElement("i");
  refreshI.classList.add(TIMS_ICONS_CLASS,ICON_REFRESH_02_CLASS);
  refreshButton.appendChild(refreshI);
  cardHeaderDiv.appendChild(badgeSpan);
  cardHeaderDiv.appendChild(refreshButton);

  //cardBody div 만들기 : name
  const cardBodyDiv=document.createElement("div");
  cardBodyDiv.classList.add(CARD_BODY_CLASS,TEXT_CENTER_CLASS);
  const containerNameH4=document.createElement("h4");
  containerNameH4.innerText=containerInfo[CONTAINER_KEY_NAME]
  cardBodyDiv.appendChild(containerNameH4);

  //cardFooter div만들기 : button
  const cardFooterDiv=document.createElement("div");
  cardFooterDiv.classList.add(CARD_FOOTER_CLASS,TEXT_CENTER_CLASS);

  const sampleButton=document.createElement("button");
  sampleButton.classList.add(BTN_CLASS,BTN_PRIMARY_CLASS,BTN_LINK_CLASS);
  const sampleI=document.createElement("i");
  sampleI.classList.add(TIMS_ICONS_CLASS);
  sampleButton.appendChild(sampleI);

  const containerRunButton=sampleButton.cloneNode(true);
  containerRunButton.classList.add(RUN_BUTTON_CLASS);
  containerRunButton.addEventListener("click",handleContainerRunButtonClick);
  containerRunButton.querySelector("i").classList.add(ICON_TRIANGLE_RIGHT_17_CLASS);

  const containerPauseButton=sampleButton.cloneNode(true);
  containerPauseButton.classList.add(PAUSE_BUTTON_CLASS);
  containerPauseButton.addEventListener("click",handleContainerPauseButtonClick);
  containerPauseButton.querySelector("i").classList.add(ICON_BUTTON_PAUSE_CLASS);

  const states=containerInfo[CONTAINER_KEY_STATE];
  let resultState=null;
  states.forEach((state)=>resultState=state);
  if(resultState==="Running"){
    badgeSpan.classList.add(BADGE_INFO_CLASS);
    containerRunButton.classList.add(DISABLED_CLASS);
  }else{ 
    badgeSpan.classList.add(BADGE_DANGER_CLASS);
    containerPauseButton.classList.add(DISABLED_CLASS);
  }

  const containerMonitoringButton=sampleButton.cloneNode(true);
  containerMonitoringButton.classList.add(MONITORING_BUTTON_CLASS);
  containerMonitoringButton.addEventListener("click",handleContainerMonitoringButtonClick)
  containerMonitoringButton.querySelector("i").classList.add(ICON_TV_2_CLASS);

  cardFooterDiv.appendChild(containerRunButton);
  cardFooterDiv.appendChild(containerPauseButton);
  cardFooterDiv.appendChild(containerMonitoringButton);

  //cardDiv에 cardHeader, cardBody, cardFooter담기
  cardDiv.appendChild(cardHeaderDiv);
  cardDiv.appendChild(cardBodyDiv);
  cardDiv.appendChild(cardFooterDiv);

  return cardDiv;
}

/*====================================================================================================================*/ 

function makeCardTitleHeader(serviceName,serviceIP){
  const cardHeaderDiv=document.createElement("div");
  cardHeaderDiv.classList.add(CARD_HEADER_CLASS,ROW_CLASS);
  //card title for service name
  const serviceNameH3=document.createElement("h3");
  serviceNameH3.classList.add(CARD_TITLE_CLASS,D_INLINE_CLASS,COL_4_CLASS,TEXT_LEFT_CLASS);
  serviceNameH3.id=serviceName;
  serviceNameH3.innerText=serviceName;
  //card title for service ip
  const serviceIPA=document.createElement("a");
  const serviceIPH3=document.createElement("h3");
  serviceIPH3.classList.add(CARD_TITLE_CLASS,D_INLINE_CLASS,COL_4_CLASS,TEXT_CENTER_CLASS);
  serviceIPH3.id=serviceIP;
  serviceIPH3.innerText=serviceIP ? serviceIP : "";
  serviceIPA.href=`http://${serviceIPH3.innerText}`;
  serviceIPA.target="_blank";
  serviceIPA.rel="noopener noreferrer";
  serviceIPA.appendChild(serviceIPH3);

  //card title for managing button
  const serviceManagingButton=document.createElement("button");
  serviceManagingButton.classList.add(CARD_TITLE_CLASS, BTN_CLASS,BTN_PRIMARY_CLASS,BTN_LINK_CLASS,COL_2_CLASS,TEXT_RIGHT_CLASS);
  serviceManagingButton.id="serviceManagingButton";
  const serviceMangingButtonIcon=document.createElement("i");
  serviceMangingButtonIcon.classList.add(TIMS_ICONS_CLASS,ICON_SETTING_GEAR_63_CLASS);
  serviceManagingButton.addEventListener("click",()=>window.location.href="editDeploy.html")
  serviceManagingButton.appendChild(serviceMangingButtonIcon);

  cardHeaderDiv.appendChild(serviceNameH3);
  cardHeaderDiv.appendChild(serviceIPA);
  cardHeaderDiv.appendChild(serviceManagingButton);
  //cardHeaderDiv.appendChild(refreshButton);
  return cardHeaderDiv;
}

function printCardTitle(serviceName,serviceIP){
  console.log("printCardTitle Func Starts...");
  const targetParent=document.querySelector("div.content>div.row>div.col-md-12>div.card");
  const childElement=makeCardTitleHeader(serviceName,serviceIP);
  targetParent.prepend(childElement);
}

window.TrackJS &&
  TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free",
  });