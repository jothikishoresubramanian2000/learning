const role = "editor";

switch (role){

    case "admin":
        console.log("full");
        break;
    case "editor":
        console.log("write")
        //break; // fall through if no break and end up in next case
    case "viewer":
        console.log("read")
        break;
    default:
        console.log("no access")
        break;
}