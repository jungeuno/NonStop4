const baseURL=window.location.origin;
const userEmail=localStorage.getItem("user-email");
const formElemnt=document.querySelector("form#editDeployForm");

function handleUpdateButtonClick(){
    const requestURI=`/users/${userEmail}/services/`


}
function handleDeleteButtonClick(){

}
$(document).ready(function() {
    $().ready(function() {
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