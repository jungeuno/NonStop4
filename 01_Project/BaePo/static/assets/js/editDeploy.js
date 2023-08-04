const baseURL=window.location.origin;
const KEY_USER_EMAIL="user-email";
const KEY_SERVICE_NAME="service-name";
const formElemnt=document.querySelector("form#editDeployForm");

function handleUpdateButtonClick(){
    const requestURI=`/users/${userEmail}/services/${serviceName}`


}
function handleDeleteButtonClick(){

}
$(document).ready(function() {
    $().ready(function() {
        const userEmail=localStorage.getItem(KEY_USER_EMAIL);
        const serviceName=localStorage.getItem(KEY_SERVICE_NAME);
        const updateButton=document.querySelector("button#updateButton");
        const deleteButton=document.querySelector("button#deleteButton");

        updateButton.addEventListener("click",handleUpdateButtonClick);
        deleteButton.addEventListener("click",handleDeleteButtonClick);

        $('#devEnv').bsMultiSelect({
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