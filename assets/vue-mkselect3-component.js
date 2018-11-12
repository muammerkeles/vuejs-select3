Vue.component("mkselect", {
  template:`<div class="template container" ref="mksindicator">
    <div class="mk-select">
      <div class="indicator">
        <span class="crop">
          <span class="single" v-on:click="openActionBar();resize()">
            <span class="sel-input">
                {{placeholder}}
             </span>
            <span class="sel-arrow"><b class="b-role"></b></span> 
          </span>
        </span>
      </div></div> </div> </div>`,
  props: ["ajaxsettings"],
  data: function() {
    return {
      selected:{},
      datas:null,
      search: "",lastSearch:"",
      AjaxSettings:this.ajaxsettings,
      isResultBar: !1,
      isSearching: !1,placeholder:'Select',
      displayText:null,displayValues:[],
      SubComponent:null
    };
  },
  mounted:function(){
    console.clear();    
    var self=this;
    var ComponentClass = Vue.extend({
            name: 'results',
            data: function() {
                return { 
                  selfparent:self
                }
            },
            template: `<div class="mkselect-result">
              <transition name="fade">
            <div v-if="selfparent.isResultBar">
                <div class="input-group">
                    <input type="text" ref="searchinput" placeholder="begin searching" class="form-control" v-on:input="oninput2" v-model="selfparent.search" data-toggle="tooltip" title="" />
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary bg-light" type="button">Clear</button>
                      <button class="btn btn-primary" type="button" hidden>Search</button>
                    </div>
                  </div>
                </div>
              </transition>
        <transition name="fade">  
                  <div class="mk-sb-result text-left" v-if="selfparent.isResultBar">
                    <ul class="list-group" >
                      <li class="list-group-item" 
                          v-for="(item,index) in selfparent.listener"
                          v-on:click="selfparent.onPressItem(item.value)" >{{item.text}}</li>
                    </ul>           
              </transition>
        </div>
             `,
          methods:{
            oninput2: function() {      
                this.selfparent.showTooltip();
                var self=this;
                if(this.selfparent.search.length<1 || this.selfparent.search==this.selfparent.lastSearch){
                  return false;
                }      
                this.selfparent.fetchData(function(e){
                  console.log(e);
                  self.selfparent.isSearching = false;
                  self.selfparent.displayText=self.selfparent.AjaxSettings.displayValues;
                  //var _copy = Object.assign([], e);
                  self.selfparent.datas=e;
                  //self.$nextTick(()=>{         
                    //self.$refs.bus.displayText=self.AjaxSettings.displayValues;
                    //self.$refs.bus.datas=e;
                  //});
                },function(error){
                  self.selfparent.isSearching = false;
                  alert("error");
                  console.log("error",error);        
                });
              },
             onPressItem:function(d){
            this.selected=this.datas.filter(function(item,index){
              return (d==index ? item : null);
              })[0];
               this.isResultBar = !1;
              this.placeholder="";
              var self=this;
              this.displayText.forEach((x)=>{
                if(this.selected[x] !== undefined
                   && this.selected[x]!== null
                   && this.selected[x]!= "null" 
                   &&  this.selected[x]!= "undefined"){              
                  this.placeholder +=this.selected[x] + " ";
                }
              });
            this.getSelectedObject();
           },
            }
      });
  
  //finish
    this.SubComponent = new ComponentClass()
    this.SubComponent.$mount()  
    document.body.appendChild(this.SubComponent.$el);  
    
    window.addEventListener("resize", this.resize);
  },
  ready:function(){
     this.resize;
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    oninput: function() {      
      this.showTooltip();
      var self=this;
      if(this.search.length<1 || this.search==this.lastSearch){
        return false;
      }      
      this.fetchData(function(e){
        self.isSearching = false;
        self.displayText=self.AjaxSettings.displayValues;
        //var _copy = Object.assign([], e);
        self.datas=e;
        //self.$nextTick(()=>{         
          //self.$refs.bus.displayText=self.AjaxSettings.displayValues;
          //self.$refs.bus.datas=e;
        //});
      },function(error){
        self.isSearching = false;
        alert("error");
        console.log("error",error);        
      });
    },
    openActionBar: function() {
      this.isResultBar = !this.isResultBar;
      this.$nextTick(() => {
        let _i = this.SubComponent.$refs.searchinput;
        if (_i != undefined) {
          _i.focus();
        }
      });
      
    },
    showTooltip() {
      // burada tooltip göster böyle =>> "xxx için aranıyor"
      //alert(this.search);
    },
    fetchData(callbacks,unsuccesss) {
      let self = this;       
      self.isSearching = true;
      let params = {};
      
      if (self.AjaxSettings.requestKey != undefined) {
        params[self.AjaxSettings.requestKey] = self.search;
      }else{
        return false;
      }
      const options = {        
        method:self.AjaxSettings.method != undefined ? this.ajaxsettings.method
            : "Get",
        //mode: 'no-cors',
        params,
         //headers:{ 'Content-type': 'application/json;charset=UTF-8' } 
      };

       //console.log("options",options);
       //const myRequest = new Request(self.AjaxSettings.url);
       fetch(self.AjaxSettings.url,options).then(response => {
          return response.json();
        })
        .then(datap => {
          callbacks(datap);           
        })
        .catch(error => {
          unsuccesss(error);          
        });      
    },
    onPressItem(d){
      this.selected=this.datas.filter(function(item,index){
        return (d==index ? item : null);
        })[0];
         this.isResultBar = !1;
        this.placeholder="";
        var self=this;
        this.displayText.forEach((x)=>{
          if(this.selected[x] !== undefined
             && this.selected[x]!== null
             && this.selected[x]!= "null" 
             &&  this.selected[x]!= "undefined"){              
            this.placeholder +=this.selected[x] + " ";
          }
        });
      this.getSelectedObject();
     },
    onClear(){      
    },
    getSelectedObject(){
        let _copy = Object.assign({}, this.selected);
        this.$emit("getselected",_copy);
    },
    resize(){
      var self=this;
      let el=self.$el;
      var rect = el.getBoundingClientRect();
      var subCompRect = self.SubComponent.$el.getBoundingClientRect();
      var style = el.currentStyle || window.getComputedStyle(el);
      self.SubComponent.$el.style.width=el.offsetWidth -(el.offsetLeft)+"px";
      self.SubComponent.$el.style.left=(rect.left + el.offsetLeft) + "px";
      self.SubComponent.$el.style.top=((rect.top + rect.height ))+"px";
      self.SubComponent.$el.style.paddingRight=style.paddingRight;
    }
  },
  computed:{
    listener(){
      if(this.datas==null){
        return null;
      }
      var self=this;
      var result=[];
      self.datas.filter(function(item,index){
        let chunk={};
        chunk.text="";
        chunk.value=index;
        chunk.data=item;        
        self.displayText.forEach((x)=>{
          if(item[x] !== undefined
             && item[x]!== null
             && item[x]!= "null" 
             &&  item[x]!= "undefined"){            
            chunk.text +=item[x] + " ";
          }
        });
        result.push(chunk);
      });
      return result; 
    },
     
  }
});
