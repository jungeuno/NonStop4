/* containerList.html의 동작 흐름
1. 페이지 불러오기 전에 서버에서 유저 id로 서비스 리스트 요청
    - request : GET /users/{user-id}/services
    - response : 특정 유저의 서비스 목록
      {
          "services" : [
            "App1",
            "App2",
            "App3"
          ]
      }
2. 위의 응답을 가지고 사이드 바 구성
    - 첫번째 서비스에 active상태 걸어주기
3. 사이드 바의 서비스 목록에서 active 서비스명을 가지고 서버에 컨테이너 리스트 요청
    - request : GET users/{user-id}/services/{service-id}/containers
    - response : 특정 서비스의 컨테이너 목록
        container-name, container-state, container-envs, container-id
        {
          "containers" : [
            {
              "contaienr-name" : "App1Backend",
              "container-state" "run",
              "container-envx" : [ "python", "flask" ]
            },
            {
              "contaienr-name" : "App1Frontend",
              "container-state" "run",
              "container-envx" : [ "bootstrap", "react" ]
            },
          ]
        }
4. 위의 응답을 가지고, 메인 화면 구성
    - container-name 박아주기
    - container-id 박아주기
    - conatainer-state에 따라서 색깔 구성 (run : green, stop : red)
    - run이면 run-button 비활성화, stop이면 stop버튼 비활성화
    - container-envs에 따라서 아이콘 넣어주기  ex) springboot, python, 등,,,
5. 기타 작업
    - 서비스 추가 버튼 
        -> 사용자로부터 새 서비스명 입력
        -> '생성하기'버튼 누르면
        -> '새 서비스명', '사용자id' 서버로 보내기
        -> 서버에서 데이터베이스에 추가하기
    - container monitoring button 
        -> button이 클릭된 container의 id를 추출
        -> containerDash.html로 이동 : container-id 담아서
    - container managing button 
        -> button이 클릭된 container의 id를 추출
        -> editDeploy.html로 이동 : container-id 담아서
    - container plus button 
        -> user-id, service-id 추출
        -> deploy.html로 이동 : user-id, service-id 담아서 
*/

//class names for nav element 
const TIMS_ICONS_CLASS="tim-icons";
const ICON_CHART_PIE_CLASS="icon-chart-pie-36";
const FONT_WEIGHT_BOLD_CLASS="font-weight-bold";
const ACTIVE_CLASS="active";
//class names for container element
const CARD_CLASS="card";
const CARD_SIZE_CLASS="col-4";
const CARD_MARGIN_CLASS="mr-3";
const CARD_STYLE="border:1px solid #e44cc4";
const CARD_HEADER_CLASS="card-header";
const BADGE_CLASS="badge";
const BADGE_PILL_CLASS="badge-pill";
const BADGE_BLUE_CLASS="badge-info";
const BADGE_RED_CLASS="badge-danger";
const BADGE_SIZE="col-1";
const FRAMEWORK_SIZE_CLASS="col-10";
const FRAMEWORK_PADDING_CLASS="pr-0";
const CARD_BODY_CLASS="card-body";
const TEXT_CENTER_CLASS="text-center";
const TEXT_RIGHT_CLASS="text-right";
const CARD_FOOTER_CLASS="card-footer";
const BUTTON_CLASS="btn";
const BUTTON_PRIMARY_CLASS="btn-primary";
const BUTTON_LINK_CLASS="btn-link";
const BUTTON_DISABLED_CLASS="disabled";
const ICON_TRIANGLE_CLASS="icon-triangle-right-17";
const ICON_PAUSE_CLASS="icon-button-pause";
const MONITORING_BUTTON_CLASS="monitoring-btn";
const MANAGING_BUTTON_CLASS="managing-btn";
const ICON_MONITORING_CLASS="icon-tv-2";
const ICON_MANAGING_CLASS="icon-settings-gear-63";

const baseURL=window.location.origin;
const userId=localStorage.getItem("user-id");

window.TrackJS &&
  TrackJS.install({
    token: "ee6fab19c5a04ac1a32a645abde4613a",
    application: "black-dashboard-free",
  });

async function getServiceList(userId) {
  //사용자 id를 가지고 서비스 목록을 가져온다
  //error처리는 함수 호출 부에서 then / catch로 처리
  const requestURI = `/users/${userId}/services`;
  const url = baseURL + requestURI;
  const options = {
    method: "GET",
  };
  try{
    let response = await fetch(url, options);
    if (response.ok){
      const serviceListJSON=await response.json();
      console.log(serviceListJSON); 
      const serviceList=JSON.parse(serviceListJSON)["services"];
      return serviceList;
    } else { //재요청 
      console.log(response.status);
      //getServiceList(userId);
    }
  } catch(error) {
    console.log(`register func에서 에러 발생 : \n${error}`);
  }
}

async function handleNavElementClick(event){ //nav에서 특정 앱을 클릭하면 하는 작업
  console.log("handleNavElementClick Func Start..."); //for logging
  //1. 기존 active붙어있는 애한테서 active class 제거하기
  const previousActiveLi=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active");
  console.log(previousActiveLi);
  previousActiveLi.classList.remove(ACTIVE_CLASS);

  //2. click된 li tag에 active class 붙이기
  event.target.parentNode.classList.add("active");
  
  //3. click된 li의 a tag에서 serviceId꺼내서 요청보내기
  const serviceId=event.target.parentNode.id;
  const containerList=await getContainerList(userId,serviceId);
  printContainerList(containerList);
}

function makeNavElement(serviceInfo){
  const li=document.createElement("li");
  li.id=serviceInfo.serviceName;
  const a=document.createElement("a");
  const i=document.createElement("i");
  i.classList.add(TIMS_ICONS_CLASS,ICON_CHART_PIE_CLASS);
  const p=document.createElement("p");
  p.classList.add(FONT_WEIGHT_BOLD_CLASS);
  p.innerText=serviceInfo["serviceName"];
  a.appendChild(i);
  a.appendChild(p);
  li.appendChild(a);
  return li;
}

function printNavWithServiceList(serviceList) {
  for (let i = 0; i < serviceList.length; i++) {
    let li=makeNavElement(serviceList[i]);
    if(i===0){
      li.classList.add("active");
    }
  }
}


async function getContainerList(userId, serviceId) {
  const requestURI = `/users/${userId}/services/${serviceId}/containers`;
  const url = baseURL + requestURI;
  const options = {
    method: "GET",
  };
  try{
    const response=await fetch(url,options);
    if(response.ok){
      const json=await response.json();
      //json 가공해서 arr로 만들기
      const containerList=JSON.parse(json)["containers"];
      return containerList;
    }
    else{
      //다시 요청보내기
      console.log(response.status);
    }
  } catch(error) {
    console.log(error);
  }
}

function printContainerList(containerList){
  for (let i = 0; i < containerList.length; i++) {
    makeNavElement(containerList[i]);
  }
}

function handleContainerRunButtonClick(event){ //container state stop -> run변경
  const cardDiv=event.target.parentNode.parentNode;
  const containerId=cardDiv.id;
  const requestURI = `/users/${userId}/services/${serviceId}/containers/${containerId}`;
  const url = baseURL + requestURI;
  const options = {
    method: "POST",
    body : "run",
  };
  fetch(url,options)
    .then(()=>{
      const badge=cardDiv.querySelector(".card-header>.badge");
      const runButton=cardDiv.querySelector(".card-footer").firstChild();
      const pauseButton=runButton.nextSibling();
      badge.classList.remove(BADGE_RED_CLASS);
      badge.classList.add(BADGE_BLUE_CLASS);
      runButton.classList.add(BUTTON_DISABLED_CLASS);
      pauseButton.classList.remove(BUTTON_DISABLED_CLASS);
    });
}

function handleContainerPauseButtonClick(event){ //container state run -> stop으로 변경
  const cardDiv=event.target.parentNode.parentNode;
  const containerId=cardDiv.id;
  const requestURI = `/users/${userId}/services/${serviceId}/containers/${containerId}`;
  const url = baseURL + requestURI;
  const options = {
    method: "POST",
    body: "pause",
  };
  fetch(url,options)
    .then(()=>{
      const badge=cardDiv.querySelector(".card-header>.badge");
      const runButton=cardDiv.querySelector(".card-footer").firstChild();
      const pauseButton=runButton.nextSibling();
      badge.classList.remove(BADGE_BLUE_CLASS);
      badge.classList.add(BADGE_RED_CLASS);
      pauseButton.classList.add(BUTTON_DISABLED_CLASS);
      runButton.classList.remove(BUTTON_DISABLED_CLASS);
    });
}

function handleContainerMonitoringButtonClick(event){ //containerDash.html로 이동 userid, serviceid, containerid가지고
  const cardDiv=event.target.parentNode.parentNode;
  const containerId=cardDiv.id;
  const requestURI = `/users/${userId}/services/${serviceId}/containers/${containerId}`;
  const url = baseURL + requestURI;
  const options = {
    method: "GET",
  };
  fetch(url,options);
}

function handleContainerManagingButtonClick(event){ //editDeploy.html로 이동 userid,serviceid가지고
  const cardDiv=event.target.parentNode.parentNode;
  const containerId=cardDiv.id;
  const requestURI = `/users/${userId}/services/${serviceId}/containers/${containerId}`;
  const url = baseURL + requestURI;
  const options = {
    method: "UPDATE",
  };
  fetch(url,options);
}

function makeContainerElement(containerInfo){
  const cardDiv=document.createElement("div");
  cardDiv.classList.add(CARD_CLASS,CARD_SIZE_CLASS,CARD_MARGIN_CLASS);
  cardDiv.style=CARD_STYLE;
  cardDiv.id=containerInfo.containerName;

  const cardHeaderDiv=document.createElement("div");
  cardHeaderDiv.classList.add(CARD_HEADER_CLASS);
  const badgeSpan=document.createElement("span");
  badgeSpan.classList.add(BADGE_CLASS,BADGE_PILL_CLASS,BADGE_SIZE);
  const frameworkIconI=document.createElement("i");
  frameworkIconI.classList.add(FRAMEWORK_PADDING_CLASS,FRAMEWORK_SIZE_CLASS,TEXT_RIGHT_CLASS);
  cardHeaderDiv.appendChild(badgeSpan);
  cardHeaderDiv.appendChild(frameworkIconI);

  const cardBodyDiv=document.createElement("div");
  cardBodyDiv.classList.add(CARD_BODY_CLASS,TEXT_CENTER_CLASS);
  const containerNameH4=document.createElement("h4");
  containerNameH4.innerText=containerInfo.containerName;
  cardBodyDiv.appendChild(containerNameH4);

  const cardFooterDiv=document.createElement("div");
  cardFooterDiv.classList.add(CARD_FOOTER_CLASS,TEXT_CENTER_CLASS);
  const containerRunButton=document.createElement("button");
  containerRunButton.classList.add(BUTTON_CLASS,BUTTON_PRIMARY_CLASS,BUTTON_LINK_CLASS);
  const containerRunI=document.createElement("i");
  containerRunI.classList.add(TIMS_ICONS_CLASS,ICON_TRIANGLE_CLASS);
  containerRunButton.appendChild(containerRunI);

  const containerPauseButton=document.createElement("button");
  containerPauseButton.classList.add(BUTTON_CLASS,BUTTON_PRIMARY_CLASS,BUTTON_LINK_CLASS);
  const containerPauseI=document.createElement("i");
  containerPauseI.classList.add(TIMS_ICONS_CLASS,ICON_PAUSE_CLASS);
  containerPauseButton.appendChild(containerPauseI);

  if(containerInfo.status){
    badgeSpan.classList.add(BADGE_BLUE_CLASS);
    containerRunButton.classList.add(BUTTON_DISABLED_CLASS);
  }else{
    badgeSpan.classList.add(BADGE_RED_CLASS);
    containerPauseButton.classList.add(BUTTON_DISABLED_CLASS);
  }

  const containerMonitoringButton=document.createElement("button");
  containerMonitoringButton.classList.add(BUTTON_CLASS,BUTTON_PRIMARY_CLASS,BUTTON_LINK_CLASS,MONITORING_BUTTON_CLASS);
  containerMonitoringButton.addEventListener("click",handleContainerMonitoringButtonClick)
  const containerMonitoringI=document.createElement("i");
  containerMonitoringI.classList.add(TIMS_ICONS_CLASS,ICON_MONITORING_CLASS);
  containerMonitoringButton.appendChild(containerMonitoringI);

  const containerManagingButton=document.createElement("button");
  containerManagingButton.classList.add(BUTTON_CLASS,BUTTON_PRIMARY_CLASS,BUTTON_LINK_CLASS,MANAGING_BUTTON_CLASS);
  containerManagingButton.addEventListener("click",handleContainerManagingButtonClick);
  const containerManagingI=document.createElement("i");
  containerManagingI.classList.add(TIMS_ICONS_CLASS,ICON_MANAGING_CLASS);
  containerManagingButton.appendChild(containerManagingI);

  cardFooterDiv.appendChild(containerRunButton);
  cardFooterDiv.appendChild(containerPauseButton);
  cardFooterDiv.appendChild(containerMonitoringButton);
  cardFooterDiv.appendChild(containerManagingButton);
}

async function loadData(){
  const serviceList=await getServiceList(userId);
  printNavWithServiceList(serviceList);

  const activeServiceId=document.querySelector(".sidebar>.sidebar-wrapper ul.nav li.active").id;
  const containerList=await getContainerList(userId,activeServiceId);
  printContainerList(containerList);
}
function startHtml() {
  console.log("startHtml call");
  const sidebarNav = document.querySelector(".sidebar>.sidebar-wrapper ul.nav");

  loadData();

  const userEmailP=document.querySelector("p#userEmail");
  const userEmail=userEmailP.innerText;
  localStorage.setItem("user-email",userEmail);

  /*for modal
  const openAddServiceModalBtn = document.getElementById(
    "openAddServiceModalBtn"
  );
  const addServiceBtn = document.getElementById("addServiceBtn");
  $("#newServiceModal").on("shown.bs.modal", function () {
    document.getElementById("newServiceName").focus();
  });
  openAddServiceModalBtn.addEventListener("click", () => {
    $("#newServiceModal").modal("show");
  });
  addServiceBtn.addEventListener("click", () => {
    const newServiceName = document.querySelector("#newServiceName").innerText;
    console.log(newServiceName);
    makeNavElement(newServiceName);
  });
  */

  const newContainerBtn = document.getElementById("openAddServiceModalBtn");
  newContainerBtn.addEventListener("click", function () {
    location.href = "deploy.html";
  });

  const monitoringBtns = document.querySelectorAll(".monitoring-btn");
  for (let i = 0; i < monitoringBtns.length; i++) {
    const btn = monitoringBtns[i];
    btn.addEventListener("click", () => {
      //사용자 id도 같이 보내줘야 한다.
      location.href = "containerDash.html";
    });
  }

  const managingBtns = document.querySelectorAll(".managing-btn");
  for (let i = 0; i < managingBtns.length; i++) {
    const btn = managingBtns[i];
    btn.addEventListener("click", () => {
      //사용자 id도 같이 보내줘야 한다.
      location.href = "editDeploy.html";
    });
  }
}

$(document).ready(() => $().ready(startHtml));
