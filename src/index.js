import "./styles.css"
import Indigo from "./lib/indigo/indigo"

import AppComponent from "./app/components/app/app"
import FilterPanel from "./app/components/filter-panel/filter-panel";
import Summary from "./app/components/summary/summary";
import AddTaskForm from "./app/components/add-task-form/add-task-form";
import Task from "./app/components/task/task";

import Route from "./lib/indigo/router/route"
import RouterLink from "./lib/indigo/router/router-link";
import RouterLinkGroup from "./lib/indigo/router/router-link-group";


let indigo=new Indigo();
indigo.component("app", AppComponent);
indigo.component("add-task-form", AddTaskForm);
indigo.component("filter-panel", FilterPanel);
indigo.component("summary", Summary);
indigo.component("task", Task);

indigo.component("route", Route);
indigo.component("router-link", RouterLink);
indigo.component("router-link-group", RouterLinkGroup);

indigo.filter("test", function (value) {
    return("Test: "+value)
})

indigo.render(document.querySelector("#app"), "app");
