import { BASE_URL, 
    TIMS_ICONS_CLASS, ICON_CHART_PIE_36_CLASS,FONT_WEIGHT_BOLD_CLASS,
    USER_DATA_KEY_SERVICE_NAME } from "./constant.js";

const baseURL=window.location.origin;

function cleanNodeByQuerySelector(querySelectorString){
  const parentNode=document.querySelector("#containerListCard .row .card-group");
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

export {
  getUserData,
  makeNavElement,
  printNavWithServiceList,
  cleanNodeByQuerySelector,
};