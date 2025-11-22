import Router from "#config/router";

// Pages
import error from "#page/404";
import Index from "#page/index";

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {()=>{}} component
 * @property {()=>{} | string} title
 */

/** @type {Route[]} */
const routes = [{path: "/", component: new Index(),  title: "GleamTouch Ghana | Online Shopping for Jewelries and more"},{ path: "404", component: error, title: "404 - Not found" }];
//const routes=[{path:"/",component:()=>Promise.resolve(home),title:"Home Page"},{path:"/about",component:()=>Promise.resolve(About),title:"About Us"},{path:"/user/:id",component:()=>Promise.resolve(user),title:e=>`User ${e.id} Profile`},{path:"/user/:id/options",component:()=>Promise.resolve(options),title:e=>`User ${e.id} Options`},{path:"*",component:()=>Promise.resolve(home),title:"Home Page"},{path:"404",component:()=>Promise.resolve(error),title:"404 - Not found"},{path:"/game",component:()=>Promise.resolve(new game),title:"Game activated"},{path:"/h",component:()=>Promise.resolve(new HomePage),title:"Game activated"}];

export default function InitApp() {
    routes.forEach(route => {
        const component = route.component;
        route.component = () => Promise.resolve(component);
    });

    const router = new Router(routes);
    window.router = router;
    return router;
}