import { getUserData,makeNavElement,printNavWithServiceList } from "./module/function.js";
import { USER_DATA_KEY_SERVICE_NAME,
    LOCAL_STORAGE_KEY_USER_EMAIL,LOCAL_STORAGE_KEY_SERVICE_NAME} from "./module/constant.js";

const baseURL = window.location.origin;
const userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);
const serviceName=localStorage.getItem(LOCAL_STORAGE_KEY_SERVICE_NAME);

const SERVICE_EDIT_BUTTONS_CLASS="service-edit-buttons"; //edit, delete에 같은 이벤트 핸들러 걸어주기 위해서 custom class부여함

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