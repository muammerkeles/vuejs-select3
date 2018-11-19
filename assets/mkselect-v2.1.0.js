/*
 Versiyon 2.1.0 
 */


var mkselect = Vue.component("mkselect", {
    template: `<div class="template container" >
    <div class="mk-select" ref="mksindicator">
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
    props: ["ajaxsettings", "staticsettings", "mksplaceholder"],
    data: function () {
        return {
            selected: {},
            datas: null,
            search: "", lastSearch: "",

            //					####		ajaxsettings usage		### 
            //			url:"",
            //			requestKey: "", // which use with search word !
            //			method: "Get or Post",
            //			displayKeys:["name","age","city"],// i will display them
            //			dataRootKeyPattern:"results>locations"  // map tree of json data  


            //					####	staticsettings usage
            //			data:[{id:1,name:"muammer",age:"22"}],
            //			displayKeys: ["name","age"]

            isResultBar: !1,
            isSearching: !1,
            activeIndex: -1, hoverIndex: -1,
            SubComponent: null,
            placeholder: this.mksplaceholder || 'Select',
            displayResultData: null // listelenen data(gerçek datayı manipule etmemek için temporary bir data),
        };
    },
    mounted: function () {
        //console.clear();    
        this.componentInitialize();
		/*window.addEventListener('click',function(e) {
			console.log('mouse click',e);
		});
		*/
        var self = this;
        window.addEventListener('mousedown', function (e) {
            self.blurcontrol(e);
        });
    },
    ready: function () {
        this.resize();
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('resize', this.blur)
    },
    methods: {
        resetData() {
            this.selected = {},
                this.datas = null,
                this.search = "", this.lastSearch = "",
                this.ajaxsettings = undefined,
                this.staticsettings = undefined,
                this.isResultBar = !1,
                this.isSearching = !1,
                this.activeIndex = -1, this.hoverIndex = -1,
                this.SubComponent = null,
                this.placeholder = this.mksplaceholder || 'Select',
                this.displayResultData = null
        },
        blurcontrol(e) {

            if (this.SubComponent == null) {
                return false;
            }
            var menuElement = this.$el;
            var selectElement = this.SubComponent.$el;


            var g = (e.target === selectElement ||
                event.target === menuElement ||
                selectElement.contains(e.target) ||
                menuElement.contains(e.target));
            if (!g) {
                this.isResultBar = !1;
            }
        },
        reinit(newsettings) {
            this.resetData();
            var self = this;
            try {
                var r = newsettings;
                r = r.replace(/\u00A0/g, '');
                r = r.replace(/\n /g, '');
                //r=r.replace(/ /g,'');	/// boşlukları silmekten vazgeçtim çünkü örn. " Search Hotel" => "SearchHotel" oluyordu..

                let rdata = JSON.parse(r);
                for (let i in rdata) {
                    switch (i) {
                        case "ajaxsettings":
                            self.ajaxsettings = rdata[i];
                            break;

                        case "staticsettings":
                            self.staticsettings = rdata[i];
                            break;

                        case "placeholder":
                            self.mksplaceholder = rdata[i];
                            self.placeholder = rdata[i];
                            console.log("e", self.placeholder)
                            break;


                    }
                }

                this.componentInitialize();
            } catch (error) {
                self.resetData();
                console.error(error);
                alert("error! during the componenet setting re-initialize\n likely setting data was wrong!\n" + error);
            }
        },
        componentInitialize() {
            //console.trace();
            var self = this;
            if ((this.ajaxsettings == undefined || this.ajaxsettings == null) &&
                (this.staticsettings == undefined || this.staticsettings == null)) {
                //alert("no data");
                this.placeholder = "not-initialized";
                return false;
            } else {
                self.placeholder = "initilizing..";
                setTimeout(() => {
                    self.placeholder = self.mksplaceholder || 'Select';
                }, 1500);
            }

            var ComponentClass = Vue.extend({
                name: 'results',
                data: function () {
                    return {
                        selfparent: self
                    }
                },
                template: `<div class="mkselect-result">
									<transition name="fade">
								<div v-if="selfparent.isResultBar">
										<div class="input-group">
												<input type="text" ref="searchinput"
		v-on:input="oninput" 
		v-on:keydown="selfparent.keyDown"
		v-model="selfparent.search" 
		placeholder="begin searching" class="form-control" data-toggle="tooltip" title="" />
												<div class="input-group-append">
													<button class="btn btn-outline-secondary bg-light" type="button">{{selfparent.datas!=null ? selfparent.datas.length : ""}}</button>
													<button class="btn btn-primary" type="button" hidden>Search</button>
												</div>
											</div>
										</div>
									</transition>
						<transition name="fade">  
											<div class="mk-sb-result text-left" v-if="selfparent.isResultBar">
												<ul class="list-group" ref="mkresultul">
													<li class="list-group-item" 
		:class="{ 'active': index === selfparent.activeIndex,'hovered':index===selfparent.hoverIndex}"
															v-for="(item,index) in selfparent.listener"
															v-on:click="selfparent.onPressItem(item)">{{item.text}}</li>
												</ul>           
									</transition>
						</div>
								 `,
                methods: {
                    oninput: function () {

                        this.selfparent.showTooltip();
                        var self = this;
                        this.selfparent.hoverIndex = -1;
                        //this.selfparent.activeIndex=-1;
                        if (this.selfparent.ajaxsettings != undefined && this.selfparent.ajaxsettings.requestKey != undefined) {
                            if (this.selfparent.search.length < 1 || this.selfparent.search == this.selfparent.lastSearch) {
                                return false;
                            }
                            self.selfparent.fetchData(function (e) {

                                self.selfparent.isSearching = false;
                                //dataRootKey:"locations",
                                let rootkey = self.selfparent.ajaxsettings.dataRootKeyPattern;
                                //let resultpattern=self.selfparent.ajaxsettings.dataRootKeyPattern.split('>');

                                if (rootkey != undefined && rootkey != null && rootkey != "") {
                                    let rootkeypattern = self.selfparent.ajaxsettings.dataRootKeyPattern.split('>');
                                    //console.log("rootkeypattern: " ,rootkeypattern);
                                    let datam = e;
                                    ///let notfound=!1;
                                    for (let im of rootkeypattern) {
                                        //console.log("im",im);
                                        if (!datam.hasOwnProperty(im)) {
                                            //notfound=!0;
                                            alert("The parameter 'dataRootKeyPattern' did not correspond to the result data.\nPlease check your ajaxsettings of mkselect component!");
                                            return false;
                                        }
                                        datam = datam[im];
                                    }
                                    self.selfparent.datas = datam;

                                } else {
                                    self.selfparent.datas = e;
                                }
                                //self.selfparent.datas=e;
                                //var _copy = Object.assign([], e);
                            }, function (error) {
                                self.selfparent.isSearching = false;
                                alert("error x11");
                                console.log("error", error);
                                return false;
                            });

                        } else
                            if (this.selfparent.staticsettings != undefined && this.selfparent.staticsettings != null &&
                                this.selfparent.staticsettings.data != undefined && this.selfparent.staticsettings.data != null) { // use static data if so!
                                self.selfparent.datas = this.selfparent.staticsettings.data;
                                self.selfparent.isResultBar = !0;
                            }

                    },
                }
            });

            //finish
            this.SubComponent = new ComponentClass()
            this.SubComponent.$mount()
            document.body.appendChild(this.SubComponent.$el);
            /*if(self.datas!=null && self.datas!=undefined){
                self.datas=JSON.parse(self.datas);
            }
            */
            console.log("ok", this.SubComponent)
            window.addEventListener("resize", this.resize);

        },
        openActionBar: function () {

            if (this.SubComponent == null)		/// init edilmemiştir. dinamik data modu için..
            {
                alert("The (sub) Component is yet to set up!")
                return false;
            };
            this.resize();
            if (this.isResultBar) {
                this.isResultBar = !1;
                return false;
            }

            if (this.ajaxsettings != undefined) {
                this.isResultBar = !this.isResultBar;
                this.focusOnSelectedItem();
            }
            else if (this.staticsettings != undefined) {
                this.SubComponent.oninput();
            }


            this.$nextTick(() => {
                this.focusOnSelectedItem();

                let _i = this.SubComponent.$refs.searchinput;
                if (_i != undefined) {
                    _i.focus();
                }
                //if(this.isResultBar)					
                /*if(this.selfparent.staticsettings!=undefined && 
                               this.selfparent.staticsettings!=null &&
                               this.selfparent.staticsettings.data!=undefined &&
                               this.selfparent.staticsettings.data!=null){ // use static data if so!
                            console.log("Static Settings=>",this.selfparent.staticsettings);
                            //self.selfparent.displayText=self.selfparent.ajaxsettings.displayValues;
                            self.selfparent.datas=e;
                        }
                        */
            });
        },
        showTooltip() {
            // burada tooltip göster böyle =>> "xxx için aranıyor"
            //alert(this.search);
        },
        fetchData(callbacks, unsuccesss) {
            let self = this;
            self.isSearching = true;
            let params = {};

            if (self.ajaxsettings.requestKey != undefined) {
                params[self.ajaxsettings.requestKey] = self.search;
            } else {
                return false;
            }


            const options = {
                method: self.ajaxsettings.method != undefined ? this.ajaxsettings.method.toUpperCase() : "GET",
                //mode: 'no-cors',
                params,
                //headers:{ 'Content-type': 'application/json;charset=UTF-8' } 
            };

            //if(self.ajaxsettings.url.substr(self.ajaxsettings.url.length-1)!="?"){
            if (self.ajaxsettings.url.indexOf("?") == -1) {
                self.ajaxsettings.url += "?";
            };
			/*if(self.ajaxsettings.url.substr(self.ajaxsettings.url.length-1)=="&"){
				self.ajaxsettings.url=self.ajaxsettings.url.substr(0,self.ajaxsettings.url.length-1)
			};
			*/
            if (self.ajaxsettings.requestKey != undefined && self.ajaxsettings.requestKey != null && self.ajaxsettings.requestKey != "") {
                self.ajaxsettings.url +=
                    (self.ajaxsettings.url.substr(self.ajaxsettings.url.length - 1) == "?" ? "" : "&") +
                    self.ajaxsettings.requestKey + "=" + self.search;

            }
            fetch(self.ajaxsettings.url, options).then(response => {
                return response.json();
            })
                .then(datap => {
                    callbacks(datap);
                })
                .catch(error => {
                    unsuccesss(error);
                });
        },
        onPressItem(chosen) {
            this.selected = chosen;
            this.placeholder = chosen.text;
            this.isResultBar = !1;
            this.activeIndex = chosen.value;
            this.hoverIndex = chosen.value;
            this.getSelectedObject();		// to $emit
        },
        onClear() {
        },
        getSelectedObject() {
            let _copy = Object.assign({}, this.selected);
            this.$emit("getselected", _copy);
        },
        resize() {

            var self = this;
            self.$nextTick(() => {

                let el = self.$el;
                if (self.SubComponent == null)		/// init edilmemiştir. dinamik data modu için..
                {
                    return false;
                }
                var rect = el.getBoundingClientRect();
                var indicator = this.$refs.mksindicator;
                var subCompRect = indicator.getBoundingClientRect(); ///self.SubComponent.$el.getBoundingClientRect();
                var style = el.currentStyle || window.getComputedStyle(el);
                self.SubComponent.$el.style.width = subCompRect.width + "px";
                self.SubComponent.$el.style.left = (subCompRect.left) + "px";
                self.SubComponent.$el.style.top =
                    ((el.offsetHeight + self.getPosition(el).y) - self.getPosition(document.body).y) + "px";
            });
        },
        keyDown() {
            var self = this;
            switch (event.key) {
                case "Enter":
                    let chosen = this.displayResultData.filter(function (item, index) {
                        return (self.hoverIndex == index ? item : null);
                    })[0];
                    this.onPressItem(chosen);
                    break;
                case "Escape":
                    this.isResultBar = !1; break;
                case "ArrowUp":
                    this.toScrollUp(1); break;
                case "PageUp":
                    this.toScrollUp(5); break;
                case "ArrowDown":
                    this.toScrollDown(1); break;
                case "PageDown":
                    this.toScrollDown(5); break;
                case "ArrowRight": break;
                case "ArrowLeft": break;
            }
            //console.log(event.key + ' (' + event.keyCode + ')');
        },
        toScrollDown(step = 1) {
            var self = this;

            this.$nextTick(() => {
                if (self.datas != null && self.hoverIndex < self.datas.length) {
                    self.hoverIndex = (self.hoverIndex + step) > self.datas.length - 1 ? self.datas.length - 1 : self.hoverIndex + step;
                    self.arrowOverControl();
                }
            });
        },
        toScrollUp(step = 1) {
            var self = this;
            this.$nextTick(() => {
                if (this.hoverIndex > 0) {
                    this.hoverIndex = (this.hoverIndex - step) < 0 ? 0 : this.hoverIndex - step;
                    self.arrowOverControl()
                }
            });
        },
        arrowOverControl() {
            //var item = panel.container.find("li").eq(focusIndex);
            //panel.container.find("li.focus").removeClass("focus");
            //item.addClass("focus");


            var self = this;
            this.$nextTick(() => {

                if (self.hoverIndex < 0) {
                    return false;
                }

                var ul = this.SubComponent.$refs.mkresultul;



                //var item=ul.querySelectorAll('.list-group-item')[self.hoverIndex];
                var item = ul.querySelectorAll('.hovered')[0];

                //console.log("item.offsetTop",item.offsetTop);
                var itemtop = item.offsetTop;
                var itemheight = item.clientHeight

                if ((itemtop + itemheight) - ul.scrollTop > ul.clientHeight) {
                    self.animate(ul, "scrollTop", 20,
                        ul.scrollTop,
                        (itemtop - ul.clientHeight), 200, true);

                } else
                    if ((itemtop + itemheight) - ul.scrollTop <= itemheight) {
                        self.animate(ul, "scrollTop", "",
                            ul.scrollTop,
                            itemtop - itemheight, 200, true);

                    }

            });

        },
        focusOnSelectedItem() {
            this.$nextTick(() => {
                var ul = this.SubComponent.$refs.mkresultul;
                if (this.activeIndex < 0) {
                    return false;
                }

                var item = ul.querySelectorAll('.list-group-item')[this.activeIndex];
                if (item == undefined) {
                    return false;
                }
                var itemtop = item.offsetTop;
                var itemheight = item.clientHeight
                this.animate(ul, "scrollTop", 20, ul.scrollTop, (itemtop - (itemheight * 2)), 200, true);
            });
        },
        animate(elem, style = 'scrollTop', unit, from, to, time = 2000, prop = true) {
            if (!elem) {
                return;
            }
            var start = new Date().getTime(),
                timer = setInterval(function () {
                    var step = Math.min(1, (new Date().getTime() - start) / time);
                    if (prop) {
                        elem[style] = (from + step * (to - from)) + unit;
                    } else {
                        elem.style[style] = (from + step * (to - from)) + unit;
                    }
                    if (step === 1) {
                        clearInterval(timer);
                    }
                }, 25);
            if (prop) {
                elem[style] = from + unit;
            } else {
                elem.style[style] = from + unit;
            }
        },
        searchKeyword(sourceArr, term) {
            var self = this;
            let matcher = new RegExp(self.escapeRegex(term), "i");

            var results = self.grep(sourceArr, function (value) {
                var mc = matcher.test(value.text || value);
                return mc;
            });
            return results;
        },
        escapeRegex(value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        },
        grep(a, b, c) {
            var d = [],
                e;
            c = !!c;
            for (var f = 0, g = a.length; f < g; f++) e = !!b(a[f], f), c !== e && d.push(a[f]);

            return d
        },
        getPosition(el) {
            var xPos = 0;
            var yPos = 0;

            while (el) {
                if (el.tagName == "BODY") {
                    // deal with browser quirks with body/window/document and page scroll
                    var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                    var yScroll = el.scrollTop || document.documentElement.scrollTop;

                    xPos += (el.offsetLeft - xScroll + el.clientLeft);
                    yPos += (el.offsetTop - yScroll + el.clientTop);
                } else {
                    // for all other non-BODY elements
                    xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                    yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                }

                el = el.offsetParent;
            }
            return {
                x: xPos,
                y: yPos
            };
        }
    },
    computed: {
        listener() {


            if (this.datas == null) {
                return null;
            }
            var self = this;
            //var result=[];
            console.log("datas", this.datas);
            self.displayResultData = [];
            if (self.ajaxsettings != undefined && self.ajaxsettings.displayKeys != undefined) {

                console.log("here");

                if (typeof self.datas === 'object' && (self.datas instanceof Array) == false) {
                    alert("Warning!\nProbably you entered wrong value of 'dataRootKeyPattern' of 'ajaxsettings'\nrequest was succeed but the response pattern not correspond to pattern. You have must be defined pattern as 'dataRootKeyPattern'\n That's why, An error occurred!")
                    self.placeholder = "An error occurred. Probabyly related to ajaxsettings.dataRootKeyPattern has wrong defined."
                }
                self.datas.filter(function (item, index) {
                    let chunk = {};
                    chunk.text = ""; chunk.value = index; chunk.data = item;

                    self.ajaxsettings.displayKeys.forEach((x) => {
                        if (item[x] !== undefined && item[x] !== null) {
                            chunk.text += item[x] + " ";
                        }
                    });
                    self.displayResultData.push(chunk);
                });
            } else {

                self.datas.filter(function (item, index) {
                    let chunk = {};
                    chunk.text = "";
                    if (self.staticsettings.displayKeys != undefined) {
                        self.staticsettings.displayKeys.forEach((x) => {
                            if (item[x] !== undefined && item[x] !== null) {
                                chunk.text += item[x] + " ";
                            }
                        });
                    } else {
                        for (var x in item) {
                            if (item[x] !== undefined && item[x] !== null) {
                                chunk.text += item[x] + " ";
                            }
                        }
                    }
                    chunk.value = index; chunk.data = item;

                    self.displayResultData.push(chunk);
                });

                /// eğer arama için terim girilmişse datayı filtrelet
                if (self.search != null && self.search != undefined && self.search != "") {
                    self.displayResultData = self.searchKeyword(self.displayResultData, self.search);
                    //console.log("arama sonuc",aramaSonuc);
                    //return aramaSonuc;
                }
            }
            //this.self.displayResultData=result;
            return this.displayResultData;
        },
    }
});
window.addEventListener('load', function () {
});
var tempdata = [
    {
        "index": 0,
        "guid": "e6f3924d-b780-4f8c-9f92-fa42dd10be75",
        "name": "Lillie Landry",
        "gender": "female",
        "company": "MAGMINA",
        "email": "lillielandry@magmina.com",
        "address": "528 Putnam Avenue, Brethren, Colorado, 6511",
        "about": "Quis nisi nisi aliquip pariatur ex nisi velit exercitation est. Ad non dolore nostrud cupidatat in proident in reprehenderit tempor ut culpa cupidatat labore nisi. Aliquip in proident minim in nisi sint eu est. Duis mollit nulla magna enim commodo eu veniam proident quis anim pariatur id. Laboris est excepteur occaecat eiusmod amet reprehenderit dolor ipsum laborum. Irure ad sit eiusmod aliqua cupidatat adipisicing sint amet aliquip.\r\n",
        "greeting": "Hello, Lillie Landry! You have 4 unread messages.",
        "favoriteFruit": "apple"
    },
    {
        "index": 1,
        "guid": "e962b812-8b41-4583-90d7-01ffe000015b",
        "name": "Muammer Keleş",
        "gender": "male",
        "company": "Doruk Net - Trevental",
        "email": "wwebmasterkls@adornica.com",
        "address": "kurtyolu sk 298/5",
        "about": "Sint irure aliquip adipisicing proident do ex magna et minim consequat consequat eiusmod id. Enim fugiat excepteur ut duis sint est proident. Consectetur minim aliqua labore sint ad et ullamco aliquip. Elit ut labore qui voluptate officia. Aute irure ex dolore nostrud id magna consectetur duis occaecat laboris sint consequat consequat quis.\r\n",
        "greeting": "Hello, Muammer Keleş! You have 15 unread messages.",
        "favoriteFruit": "strawberry"
    },
    {
        "index": 2,
        "guid": "46579a64-be33-4941-91db-d1bc0d59a424",
        "name": "Gray Daniels",
        "gender": "male",
        "company": "ECOLIGHT",
        "email": "graydaniels@ecolight.com",
        "address": "600 John Street, Springhill, Florida, 2575",
        "about": "Ad duis pariatur ullamco est occaecat magna. Culpa consectetur aliquip est voluptate et eu velit magna. Id fugiat consectetur consectetur voluptate sit minim culpa.\r\n",
        "greeting": "Hello, Gray Daniels! You have 2 unread messages.",
        "favoriteFruit": "strawberry"
    },
    {
        "index": 3,
        "guid": "ca03003f-eac8-4679-9f08-279a17ed8eb7",
        "name": "Browning Bird",
        "gender": "male",
        "company": "OTHERWAY",
        "email": "browningbird@otherway.com",
        "address": "544 Preston Court, Bentley, District Of Columbia, 3421",
        "about": "Velit excepteur eu non adipisicing cillum do occaecat. Ad exercitation mollit ex proident aliqua quis consectetur. Ad elit nulla dolor in sunt fugiat cupidatat ea non ea consequat qui. Aute qui in tempor aliquip. Laboris esse Lorem in anim ut ipsum pariatur consectetur proident esse est ullamco nulla adipisicing.\r\n",
        "greeting": "Hello, Browning Bird! You have 2 unread messages.",
        "favoriteFruit": "strawberry"
    },
    {
        "index": 4,
        "guid": "6aa5b7b6-4b2f-481c-adea-c23655de2f10",
        "name": "Candice Mendoza",
        "gender": "female",
        "company": "PHARMACON",
        "email": "candicemendoza@pharmacon.com",
        "address": "137 Ocean Parkway, Deputy, Guam, 5408",
        "about": "Laboris est irure laboris incididunt aliquip consectetur esse excepteur in voluptate ipsum. Velit ea enim minim ad esse cillum nisi velit. Excepteur quis esse proident eiusmod excepteur anim excepteur nostrud ad duis culpa. Ut magna minim id fugiat minim ut esse do sit aliqua pariatur et. Culpa anim ut est veniam officia sint do cillum anim. Labore proident qui veniam dolore velit amet commodo non laboris commodo tempor pariatur. Labore non velit elit esse eu ipsum Lorem irure minim in nisi mollit.\r\n",
        "greeting": "Hello, Candice Mendoza! You have 1 unread messages.",
        "favoriteFruit": "banana"
    }];

var app = new Vue({
    el: "#app1",
    //props:["ajaxsettings"],
    data: function () {
        return {
            mystatic_settings: {
                data: tempdata,
                displayKeys: ["name", "company", "email"]
            },
            myajax_settings: {
                url: "https://engine.hotellook.com/api/v2/lookup.json?lang=en&lookFor=city&limit=50",
                requestKey: "query",
                method: "Get",
                dataRootKeyPattern: "results>locations",//dont forget '>' divider if needs!
                displayKeys: ["cityName", "countryName"],
            },
            delay_init_settings: undefined,
            secilenObjem: { ajax: {}, static: {}, delay: {} }
        };
    },
    mounted() {
        //console.clear();
    },
    methods: {
        reinit_delay_component() {
            let newsettings = this.$refs.delay_init_settings_div.innerText;
            this.$refs.module1.reinit(newsettings);

            /// those below are optional.
            //this.$refs.button1.style.display="none";
            //this.$refs.delay_init_settings_div.style.display="none";
        },

        MyData_ajax: function (dt) {
            this.secilenObjem.ajax = dt;
        },
        MyData_static: function (dt) {
            this.secilenObjem.static = dt;
        },
        MyData_delay: function (dt) {
            this.secilenObjem.delay = dt;
        }
    }
});
