const baseURL=window.location.origin;
const KEY_USER_EMAIL="user-email";
const KEY_SERVICE_NAME="service-name";
const SERVICE_EDIT_BUTTONS_CLASS="service-edit-buttons";
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
        const userEmail=localStorage.getItem(KEY_USER_EMAIL);
        const serviceName=localStorage.getItem(KEY_SERVICE_NAME);

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