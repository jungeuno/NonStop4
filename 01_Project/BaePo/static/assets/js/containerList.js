import {
  TIMS_ICONS_CLASS,
  ICON_CHART_PIE_36_CLASS,
  ICON_TRIANGLE_RIGHT_17_CLASS,
  ICON_BUTTON_PAUSE_CLASS,
  ICON_TV_2_CLASS,
  ICON_SETTING_GEAR_63_CLASS,
  CARD_CLASS,
  CARD_BODY_CLASS,
  CARD_HEADER_CLASS,
  CARD_GROUP_CLASS,
  CARD_FOOTER_CLASS,
  CARD_TITLE_CLASS,
  ROW_CLASS,COL_1_CLASS,COL_4_CLASS,COL_10_CLASS,COL_12_CLASS,MR_3_CLASS,PR_0_CLASS,
  BADGE_CLASS,BADGE_PILL_CLASS,BADGE_INFO_CLASS,BADGE_DANGER_CLASS,
  BTN_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_LINK_CLASS,
  DISABLED_CLASS,
  FONT_WEIGHT_BOLD_CLASS,
  ACTIVE_CLASS,
  D_INLINE_CLASS,
  TEXT_CENTER_CLASS,
  TEXT_RIGHT_CLASS,
  LOCAL_STORAGE_KEY_USER_EMAIL,
  LOCAL_STORAGE_KEY_SERVICE_NAME,
  USER_DATA_KEY_SERVICE_NAME,
  USER_DATA_KEY_CONTAINERS,
  CONTAINER_KEY_NAME,
  CONTAINER_KEY_STATE,
  PINK_BORDER_STYLE,
  MONITORING_BUTTON_CLASS,
  BASE_URL,
  LOCAL_STORAGE_KEY_CONTAINER_NAME,
} from "./module/constant.js";

import { 
  cleanNodeByQuerySelector,
} from "./module/function.js";

async function getUserData(userEmail){
  console.log("getUserData Func Start...");
  const requestURI = "/services";
  const url = BASE_URL + requestURI;
  const options = {
    method: "GET",
  };
  try{
    console.log("before fetch");
    const response=await fetch(url,options);
    console.log("after fetch printing response...");
    console.log(response);
    console.log("before parsing");
    const userData=await response.json();
    console.log("after parsing printing userData...");
    console.log(userData);
    return userData[userEmail];

  } catch(error){
    console.log(`${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`);
    console.log(error);
  }
}


async function loadData(userEmail){
  console.log("loadData Func Start...");
  const serviceList=[];

  //1. 서버에 userData요청, 현재 로그인된 유저의 정보 객체를 반환
  const userData=await getUserData(userEmail); 
  console.log(userData);
  console.log("getUserData Func End...");

  //2. serviceList에 현재 로그인된 유저의 서비스 리스트를 추가함
  userData.forEach((service) => { 
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  console.log("making service lists...");
  console.log(serviceList);

  //3. 서비스 리스트 이용해서 navbar 내용 넣기
  printNavWithServiceList(serviceList); 
  console.log("after completing navbar");
  console.log(document.querySelectorAll(".sidebar>.sidebar-wrapper .nav"));
  console.log("Adding navbar eventhandler");
  
  //4. 3에서 만든 navbar의 요소들에 이벤트 핸들러 추가
  const navElements=document.querySelectorAll(".sidebar>.sidebar-wrapper .nav>li>a");
  for (let i=0;i<(navElements.length)-1;i++){
    navElements[i].addEventListener("click",(event)=>handleNavElementClick(event,userData)); 
  }

  console.log("printing active nav id");
  //5. navbar 요소 만들면서 active로 지정해준 현재 보고 있는 서비스 명 가져오기
  const activeServiceName=document.querySelector(".sidebar>.sidebar-wrapper .nav>li.active").id; //const activeServiceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME) 
  console.log(activeServiceName);

  //6. card Title 만들기 : 이름 + 수정하기 버튼 + 핸들러 추가
  printCardTitle(activeServiceName);
  console.log("after printing card title");

  console.log("adding eventhandler to serviceManagingButton");
  const serviceManagingButton=document.querySelector("#serviceManagingButton");
  serviceManagingButton.addEventListener("click",()=>{
    console.log("service managing button clicke");
    window.location.href="editDeploy.html"
  });

  //7. 현재 보고 있는 서비스의 컨테이너 리스트를 꺼내서 화면 구성하기
  console.log("lets find active container object");
  console.log("printing userData");
  console.log(userData);
  const activeContainerObj=userData.find((service)=>service[USER_DATA_KEY_SERVICE_NAME]===activeServiceName);
  console.log(activeContainerObj);
  const activeContainerList=activeContainerObj[USER_DATA_KEY_CONTAINERS];
  console.log(activeContainerList);
  //console.log(activeContainerList);
  printContainerList(activeContainerList);

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

  loadData(userEmail);

  const newContainerBtn = document.querySelector("#deployButton");
  newContainerBtn.addEventListener("click", function () {
    console.log("배포하기 버튼 클릭");
    window.location.href = "deploy.html";
  });

}

$(document).ready(() => $().ready(startHtml));

function handleNavElementClick(event,userData){ //nav에서 특정 앱을 클릭하면 하는 작업
  //active붙어있는 애한테서 active class 제거하기
  const previousActiveLi=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active");
  previousActiveLi.classList.remove(ACTIVE_CLASS);
  localStorage.removeItem(LOCAL_STORAGE_KEY_SERVICE_NAME);

  //2. click된 li tag에 active class 붙이기 event.target : p tage
  const a=event.target.parentNode;
  const li=a.parentNode;
  li.classList.add(ACTIVE_CLASS);
  
  //3. click된 li의 a tag에서 serviceId꺼내서 요청보내기
  const newActiveServiceName=li.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME,newActiveServiceName);
  const activeContainerObj=userData.find((service)=>service[USER_DATA_KEY_SERVICE_NAME]===newActiveServiceName);
  const activeContainerList=activeContainerObj[USER_DATA_KEY_CONTAINERS];

  //4. card 비우기
  const cardQuerySelectorString="div.content>div.row>div.col-md-12>div#card";
  cleanNodeByQuerySelector(cardQuerySelectorString);


  //5. card header 넣기
  printCardTitle(newActiveServiceName);

  //6. card group 클릭된 서비스 관련 내용으로 넣기
  printContainerList(activeContainerList);
}

function makeNavElement(serviceName){
  console.log("makeNavElement Func Starts...");
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
  console.log("printNavWithServicelist Func Starts...");
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

function printContainerList(containerList){
  console.log("printContainerList Func Starts...");
  const card=document.querySelector("div.content>div.row>div.col-md-12>div#card");

  const cardBodyDiv=document.createElement("div");
  cardBodyDiv.classList.add(CARD_BODY_CLASS);
  cardBodyDiv.id="containerListCard";
  const rowDiv=document.createElement("div");
  rowDiv.classList.add(ROW_CLASS);
  const cardGroupDiv=document.createElement("div");
  cardGroupDiv.classList.add(CARD_GROUP_CLASS,COL_12_CLASS);

  card.appendChild(cardBodyDiv);
  for (let i = 0; i < containerList.length; i++) {
    let container=makeContainerElement(containerList[i]);
    cardGroupDiv.appendChild(container);
  }
  rowDiv.appendChild(cardGroupDiv);
  cardBodyDiv.appendChild(rowDiv);
  card.appendChild(cardBodyDiv);
}

function handleContainerRunButtonClick(event){ //container state stop -> run변경
  const cardDiv=event.target.parentNode.parentNode;
  const containerId=cardDiv.id;
  const requestURI = `/users/${userId}/services/${serviceId}/containers/${containerId}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "POST",
    body : "run",
  };
  fetch(url,options)
    .then(()=>{
      const badge=cardDiv.querySelector(".card-header>.badge");
      const runButton=cardDiv.querySelector(".card-footer").firstChild();
      const pauseButton=runButton.nextSibling();
      badge.classList.remove(BADGE_DANGER_CLASS);
      badge.classList.add(BADGE_INFO_CLASS);
      runButton.classList.add(DISABLED_CLASS);
      pauseButton.classList.remove(DISABLED_CLASS);
    })
    .then(()=>{
      const badge=cardDiv.querySelector(".card-header>.badge");
      const runButton=cardDiv.querySelector(".card-footer").firstChild();
      const pauseButton=runButton.nextSibling();
      badge.classList.remove(BADGE_INFO_CLASS);
      badge.classList.add(BADGE_DANGER_CLASS);
      pauseButton.classList.add(DISABLED_CLASS);
      runButton.classList.remove(DISABLED_CLASS);
    })
    .catch((error)=>{
      console.log(error);
      const badge=cardDiv.querySelector(".card-header>.badge");
      const runButton=cardDiv.querySelector(".card-footer").firstChild();
      const pauseButton=runButton.nextSibling();
      badge.classList.remove(BADGE_INFO_CLASS);
      badge.classList.add(BADGE_DANGER_CLASS);
      pauseButton.classList.add(DISABLED_CLASS);
      runButton.classList.remove(DISABLED_CLASS);
    });
}

function handleContainerMonitoringButtonClick(event){ //containerDash.html로 이동 userid, serviceid, containerid가지고
  const activeServiceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
  const cardDiv=event.target.parentNode.parentNode;
  const clickedContainerName=cardDiv.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_CONTAINER_NAME,clickedContainerName)
  window.location.href="containerDash.html";
  /*
  const requestURI = `/services/${activeServiceName}/containers/${containerName}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "GET",
  };
  fetch(url,options);
  */
}


function makeContainerElement(containerInfo){ //container data받아서 html에 표시해줄 요소 생성
  console.log("makeContainerElement Func start...");
  //card 틀 div만들기
  const cardDiv=document.createElement("div");
  cardDiv.classList.add(CARD_CLASS,COL_4_CLASS,MR_3_CLASS);
  cardDiv.style=PINK_BORDER_STYLE;
  cardDiv.id=containerInfo[CONTAINER_KEY_NAME];

  //cardHeader div만들기 : state + env
  const cardHeaderDiv=document.createElement("div");
  cardHeaderDiv.classList.add(CARD_HEADER_CLASS);
  const badgeSpan=document.createElement("span");
  badgeSpan.classList.add(BADGE_CLASS,BADGE_PILL_CLASS,COL_1_CLASS);
  badgeSpan.innerText=" ";
  const frameworkIconI=document.createElement("i");
  frameworkIconI.classList.add(PR_0_CLASS,COL_10_CLASS,TEXT_RIGHT_CLASS);
  cardHeaderDiv.appendChild(badgeSpan);
  cardHeaderDiv.appendChild(frameworkIconI);

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
  console.log("printing sample node");
  console.log(sampleButton);

  const containerRunButton=sampleButton.cloneNode(true);
  console.log("printing containerRunButton");
  console.log(containerRunButton);
  containerRunButton.querySelector("i").classList.add(ICON_TRIANGLE_RIGHT_17_CLASS);

  const containerPauseButton=sampleButton.cloneNode(true);
  containerPauseButton.querySelector("i").classList.add(ICON_BUTTON_PAUSE_CLASS);

  if(containerInfo[CONTAINER_KEY_STATE]==="run"){
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

function makeCardTitleHeader(serviceName){
  const cardHeaderDiv=document.createElement("div");
  cardHeaderDiv.classList.add(CARD_HEADER_CLASS);
  const cardTitleH3=document.createElement("h3");
  cardTitleH3.classList.add(CARD_TITLE_CLASS,D_INLINE_CLASS);
  cardTitleH3.id=serviceName;
  cardTitleH3.innerText=serviceName;
  const serviceManagingButton=document.createElement("button");
  serviceManagingButton.classList.add(CARD_TITLE_CLASS, BTN_CLASS,BTN_PRIMARY_CLASS,BTN_LINK_CLASS);
  serviceManagingButton.id="serviceManagingButton";
  const serviceMangingButtonIcon=document.createElement("i");
  serviceMangingButtonIcon.classList.add(TIMS_ICONS_CLASS,ICON_SETTING_GEAR_63_CLASS);
  serviceManagingButton.appendChild(serviceMangingButtonIcon);
  cardHeaderDiv.appendChild(cardTitleH3);
  cardHeaderDiv.appendChild(serviceManagingButton);
  return cardHeaderDiv;
}

function printCardTitle(serviceName){
  console.log("printCardTitle Func Starts...");
  const targetParent=document.querySelector("div.content>div.row>div.col-md-12>div.card");
  const childElement=makeCardTitleHeader(serviceName);
  targetParent.prepend(childElement);
}

window.TrackJS &&
  TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free",
  });