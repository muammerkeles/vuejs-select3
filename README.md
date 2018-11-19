# vuejs multifunctional select component
Searchbox Select Component

With the combination of VueJs and Bootstrap 4, a "Selectbox" component that works like "Autocomplete" with `Ajax` is being built.

## new versions usage and live demo linke below;
https://jsfiddle.net/user/muammerkeles/fiddles/


- - - -
previosly
~~https://codepen.io/muammer/pen/yQOWWQ~~

~~## usage~~
~~https://codepen.io/muammer/pen/PxbbPv~~

~~`<mkselect v-on:getselected="secilen" v-bind:ajaxsettings="Ajaxettings"></mkselect>
  `~~
~~  
 ```
 return {
        AjaxSettings: {
        url: "https://codepen.io/muammer/pen/zMBvgo.js",
        reponseParams: ["cityID", "CityName", "CountryName"],
        requestKey: "keyw",
        method: "Get",
        displayValues: ["CityName", "CountryName"]
        };
      },
```
~~

~~
  ### example
```
var app = new Vue({
  el: "#app1",
  props:["ajaxsettings"],
  data: function() {
    return {
      AjaxSettings: {
        url:"https://codepen.io/muammer/pen/zMBvgo.js",
        reponseParams: ["cityID", "CityName", "CountryName"],
        requestKey: "keyw",
        method: "Get",
        displayValues:["CityName","CountryName"]
      },
      secilenObjem:[]
    };
  },
  methods:{    
    secilen:function(dt){   
       this.secilenObjem=dt;
    }
  }
});
```
~~
