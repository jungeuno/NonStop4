const baseURL=window.location.origin;
let userEmail=localStorage.getItem("user-email");
if(userEmail===null){
    userEmail="text@gmail.com";
}

async function handleFormSubmit(event){
    event.preventDefault();
    const formElement=document.querySelector("form#deployForm");
    const formData=new FormData(formElement);
    for (let i in formData.entries()){
        console.log(i);
    }
    const requestURI=`/users/${userEmail}/services`;
    const url=baseURL+requestURI;
    const options={
        method:"POST",
        body:formData
    };
    try{
        const response=await fetch(url,options);
    } catch(error){

    }
}
$(document).ready(function() {
    $().ready(function() {
        $('form').on("submit",handleFormSubmit);

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