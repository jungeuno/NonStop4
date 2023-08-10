/* Constant ==========================================================*/
//bootstrap className
const TIMS_ICONS_CLASS = "tim-icons";
const ICON_CHART_PIE_36_CLASS = "icon-chart-pie-36";
const ICON_TRIANGLE_RIGHT_17_CLASS = "icon-triangle-right-17";
const ICON_BUTTON_PAUSE_CLASS = "icon-button-pause";
const ICON_TV_2_CLASS = "icon-tv-2";
const ICON_SETTING_GEAR_63_CLASS = "icon-settings-gear-63";

const CARD_CLASS = "card";
const CARD_BODY_CLASS = "card-body";
const CARD_HEADER_CLASS = "card-header";
const CARD_GROUP_CLASS = "card-group";
const CARD_FOOTER_CLASS = "card-footer";
const CARD_TITLE_CLASS = "card-title";

const ROW_CLASS = "row";
const COL_1_CLASS = "col-1";
const COL_4_CLASS = "col-4";
const COL_10_CLASS = "col-10";
const COL_12_CLASS = "col-12";
const MR_3_CLASS = "mr-3";
const PR_0_CLASS = "pr-0";

const BADGE_CLASS = "badge";
const BADGE_PILL_CLASS = "badge-pill";
const BADGE_INFO_CLASS = "badge-info";
const BADGE_DANGER_CLASS = "badge-danger";

const BTN_CLASS = "btn";
const BTN_PRIMARY_CLASS = "btn-primary";
const BTN_LINK_CLASS = "btn-link";

const DISABLED_CLASS = "disabled";
const FONT_WEIGHT_BOLD_CLASS = "font-weight-bold";
const ACTIVE_CLASS = "active";
const D_INLINE_CLASS = "d-inline";
const TEXT_CENTER_CLASS = "text-center";
const TEXT_RIGHT_CLASS = "text-right";

//for localStorage key
const LOCAL_STORAGE_KEY_USER_EMAIL = "user-email";
const LOCAL_STORAGE_KEY_SERVICE_NAME = "service-name";
const LOCAL_STORAGE_KEY_CONTAINER_NAME = "container-name";

//서버에서 받아오는 userData객체의 키값
const USER_DATA_KEY_SERVICE_NAME = "Service Name";
const USER_DATA_KEY_CREATING_DATE = "Creating Date";
const USER_DATA_KEY_CONTAINERS = "Containers";
const CONTAINER_KEY_NAME = "name";
const CONTAINER_KEY_ENV = "env";
const CONTAINER_KEY_STATE = "state";

//custom style for containerCardElement
const PINK_BORDER_STYLE = "border:1px solid #e44cc4";

//custom class name
const MONITORING_BUTTON_CLASS = "monitoring-btn";
const MANAGING_BUTTON_CLASS = "managing-btn";

//baseURL used in fetch api
const BASE_URL = window.location.origin;

const SERVICE_EDIT_BUTTONS_CLASS = "service-edit-buttons"; //edit, delete에 같은 이벤트 핸들러 걸어주기 위해서 custom class부여함

/*=========================================================================================================================*/
/* main function ==========================================================================================================*/
/*=========================================================================================================================*/

const userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);
const serviceName = localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);

const formElemnt = document.querySelector("form#editDeployForm");

async function loadData() {
  const serviceList = [];

  //1. 서버에서 로그인된 유저의 정보 받아오기
  const userData = await getUserData(userEmail);

  //2. 받아온 정보에서 서비스 이름만 빼서 리스트 만들고, 화면 구성하기
  userData.forEach((service) => {
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  printNavWithServiceList(serviceList);

  //3. 2에서 구성한 navbar 요소에 핸들러 추가하기
  const navElements = document.querySelectorAll(
    ".sidebar>.sidebar-wrapper .nav>li>a"
  );
  for (let i = 0; i < navElements.length - 1; i++) {
    navElements[i].addEventListener("click", handleNavElementClick);
  }

  //4. 현재 active 컨테이너에서 환경 값 LIST생성하기
  const serviceInfoObj = userData.find(
    (service) => service[USER_DATA_KEY_SERVICE_NAME] === serviceName
  );
  const containerList = serviceInfoObj[USER_DATA_KEY_CONTAINERS];
  let envList = [];
  containerList.forEach((con) => {
    envList = envList.concat(con[CONTAINER_KEY_ENV]);
  });

  //5. html에 환경 값 넣어주기
  /*
  for (let value of envList){
    const targetOption=document.querySelector(`option[value="${value}"]`);
    targetOption.setAttribute("selected",""); //동작 안함 왜,,?
    console.log(targetOption);
  }
  */
  for (let value of envList) {
    $(`option[value="${value}"]`).attr("selected", "true");
  }
}

$(document).ready(function () {
  $().ready(function () {
    document.querySelector("#userEmail").innerText = userEmail;

    loadData();

    const serviceUpdateButton = document.querySelector(`button#updateButton`);
    const serviceDeleteButton = document.querySelector(`button#deleteButton`);
    serviceUpdateButton.addEventListener(
      "click",
      handleServiceUpdateButtonClick
    );
    serviceDeleteButton.addEventListener(
      "click",
      handleServiceDeleteButtonClick
    );

    const logoutButton = document.querySelector("#logoutButton");
    logoutButton.addEventListener("click", logout);

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
  });
});

/*===========================================================================================================================*/
/* specific function ==========================================================================================================*/
/*===========================================================================================================================*/

async function handleServiceUpdateButtonClick(event) {
  console.log("handleServiceUpdateButton Clicked!!!");
  const editDeployForm = document.querySelector("#editDeployForm");
  const formData = new FormData(editDeployForm);
  const requestURI = `/services/${serviceName}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "UPDATE",
    body: formData,
  };
  console.log(url, options);
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      window.location.href = "containerList.html";
    } else {
      console.log(
        `${url}로 ${options.method}요청 서버의 비정상 응답 : [${response.status}] ${response.statusText}`
      );
    }
  } catch (error) {
    console.log(
      `${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`
    );
  }
}

/*===========================================================================================================================*/

async function handleServiceDeleteButtonClick(event) {
  console.log("handleServiceDeleteButton Clicked!!!");
  const requestURI = `/services/${serviceName}`;
  const url = BASE_URL + requestURI;
  const options = {
    method: "DELETE",
  };
  console.log(url, options);
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      location.href = "containerList.html";
    } else {
      console.log(
        `${url}로 ${options.method}요청 서버의 비정상 응답 : [${response.status}] ${response.statusText}`
      );
    }
  } catch (error) {
    console.log(
      `${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`
    );
  }
}

/*===========================================================================================================================*/
/* common function ==========================================================================================================*/
/*===========================================================================================================================*/

async function logout() {
  //console.log("logtout Func Starts...");
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

async function getUserData(userEmail) {
  console.log("getUserData Func Start...");
  const requestURI = "/services";
  const url = BASE_URL + requestURI;
  const options = {
    method: "GET",
  };
  try {
    const response = await fetch(url, options);
    const userData = await response.json();
    return userData[userEmail];
  } catch (error) {
    console.log(
      `${url}로 ${options.method}요청 작업 중 에러 발생 : \n${error}`
    );
  }
}

/*===========================================================================================================================*/

function makeNavElement(serviceName) {
  const li = document.createElement("li");
  li.id = serviceName;
  const a = document.createElement("a");
  const i = document.createElement("i");
  i.classList.add(TIMS_ICONS_CLASS, ICON_CHART_PIE_36_CLASS);
  const p = document.createElement("p");
  p.classList.add(FONT_WEIGHT_BOLD_CLASS);
  p.innerText = serviceName;
  a.appendChild(i);
  a.appendChild(p);
  li.appendChild(a);
  return li;
}

/*===========================================================================================================================*/

function printNavWithServiceList(serviceList) {
  const navUl = document.querySelector(".sidebar>.sidebar-wrapper .nav");
  let savedServiceName = localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);
  for (let i = 0; i < serviceList.length; i++) {
    let li = makeNavElement(serviceList[i]);
    if (savedServiceName === li.id) {
      // (다른 페이지에서 사이드바 클릭해서 containerList로 넘어오는 경우) || (로그인으로 넘어오는 경우)
      li.classList.add("active");
      localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME, li.id);
    }
    navUl.appendChild(li);
  }
  navUl.insertAdjacentElement(
    "beforeend",
    navUl.querySelector("li:first-child")
  );
}

/*====================================================================================================================*/

function handleNavElementClick(event, userData) {
  //nav에서 특정 앱을 클릭하면 하는 작업
  //active붙어있는 애한테서 active class 제거하기
  const previousActiveLi = document.querySelector(
    ".sidebar>.sidebar-wrapper ul.nav li.active"
  );
  previousActiveLi.classList.remove(ACTIVE_CLASS);

  //2. click된 li active로 만들기
  const a = event.target.parentNode;
  const li = a.parentNode;
  li.classList.add(ACTIVE_CLASS);

  //3. click된 li의 서비스 이름 추출해서 세션에 저장
  const newActiveServiceName = li.id;
  localStorage.setItem(LOCAL_STORAGE_KEY_SERVICE_NAME, newActiveServiceName);

  //4. containerList.html로 이동
  window.location.href = "containerList.html";
}

function fileUploadRuleModal() {
  $("#fileUploadRuleModal").modal("show");
}
