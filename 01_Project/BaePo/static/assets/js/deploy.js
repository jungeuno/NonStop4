import { getUserData,makeNavElement,printNavWithServiceList } from "./module/navbar.js";
import { USER_DATA_KEY_SERVICE_NAME, LOCAL_STORAGE_KEY_USER_EMAIL} from "./module/constant.js";

const baseURL = window.location.origin;
let userEmail = localStorage.getItem(LOCAL_STORAGE_KEY_USER_EMAIL);

async function loadData(){
  const serviceList=[];

  const userData=await getUserData(userEmail);
  userData.forEach((service) => {
    serviceList.push(service[USER_DATA_KEY_SERVICE_NAME]);
  });
  printNavWithServiceList(serviceList);

}

$(document).ready(function () {
  $().ready(function () {
    loadData();

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

    $("#pubCountry").bsMultiSelect({
      useCssPatch: true,
      cssPatch: {
        choices: {
          columnCount: "2",
        },
      },
    }); //multi select plugin
  });
});
