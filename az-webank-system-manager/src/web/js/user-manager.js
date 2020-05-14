
//处理方法 组装表格和翻页处理
var systemUserView;
azkaban.SystemUserView = Backbone.View.extend({
  events: {
    "click #pageSelection li": "handleChangePageSelection",
    "click .btn-info": "handleUpdateSystemUserBtn",
  },

  initialize: function(settings) {
    this.model.bind('change:view', this.handleChangeView, this);
    this.model.bind('render', this.render, this);
    this.model.set({page: 1, pageSize: 20});
    this.model.bind('change:page', this.handlePageChange, this);
  },

  render: function(evt) {
    console.log("render");
    // Render page selections
    var tbody = $("#userTableBody");
    tbody.empty();

    var users = this.model.get("systemUserPageList");
    var modifyI18n = this.model.get("modify");
    if(!users || users.length == 0){
      $("#pageSelection").hide()
    }else{
      $("#pageSelection").show()
    }


    for (var i = 0; i < users.length; ++i) {
      var row = document.createElement("tr");

      //组装数字行
      var tdNum = document.createElement("td");
      $(tdNum).text(i + 1);
      $(tdNum).attr("class","tb-name");
      row.appendChild(tdNum);

      //组装用户ID行
      var tdUserId = document.createElement("td");
      $(tdUserId).text(users[i].userId);
      row.appendChild(tdUserId);

      //组装用户全名行
      var tdFullName = document.createElement("td");
      $(tdFullName).text(users[i].fullName);
      $(tdFullName).attr("style","word-break:break-all;");
      row.appendChild(tdFullName);

      //组装用户部门行
      var tdDep = document.createElement("td");
      $(tdDep).text(users[i].departmentName);
      $(tdDep).attr("style","word-break:break-all;");
      row.appendChild(tdDep);

      //组装代理用户行
      var tdProxyUser = document.createElement("td");
      $(tdProxyUser).text(users[i].proxyUsers);
      $(tdProxyUser).attr("style","word-break:break-all;width:250px");
      row.appendChild(tdProxyUser);

      //组装用户角色行
      var tdRole = document.createElement("td");
      $(tdRole).text(users[i].role);
      row.appendChild(tdRole);

      //组装用户行
      var tdPermission = document.createElement("td");
      $(tdPermission).text(users[i].permission);
      $(tdPermission).attr("style","word-break:break-all;width:350px");
      row.appendChild(tdPermission);

      //组装用户邮箱行
      var tdEmail = document.createElement("td");
      $(tdEmail).text(users[i].email);
      row.appendChild(tdEmail);

      //组装操作行
      var tdAction = document.createElement("td");
      var updateBtn = document.createElement("button");
      $(updateBtn).attr("id", users[i].userId + "updateBtn");
      $(updateBtn).attr("name", users[i].userId);
      $(updateBtn).attr("class","btn btn-sm btn-info");
      $(updateBtn).text(modifyI18n);
      tdAction.appendChild(updateBtn);
      row.appendChild(tdAction);

      tbody.append(row);
    }

    this.renderPagination(evt);
  },

  renderPagination: function(evt) {
    var total = this.model.get("total");
    total = total? total : 1;
    var pageSize = this.model.get("pageSize");
    var numPages = Math.ceil(total / pageSize);

    this.model.set({"numPages": numPages});
    var page = this.model.get("page");

    //Start it off
    $("#pageSelection .active").removeClass("active");

    // Disable if less than 5
    console.log("Num pages " + numPages)
    var i = 1;
    for (; i <= numPages && i <= 5; ++i) {
      $("#page" + i).removeClass("disabled");
    }
    for (; i <= 5; ++i) {
      $("#page" + i).addClass("disabled");
    }

    // Disable prev/next if necessary.
    if (page > 1) {
      var prevNum = parseInt(page) - parseInt(1);
      $("#previous").removeClass("disabled");
      $("#previous")[0].page = prevNum;
      $("#previous a").attr("href", "#system-user#page" + prevNum);
    }
    else {
      $("#previous").addClass("disabled");
    }

    if (page < numPages) {
      var nextNum = parseInt(page) + parseInt(1);
      $("#next")[0].page = nextNum;
      $("#next").removeClass("disabled");
      $("#next a").attr("href", "#system-user#page" + nextNum);
    }
    else {
      var nextNum = parseInt(page) + parseInt(1);
      $("#next").addClass("disabled");
    }

    // Selection is always in middle unless at barrier.
    var startPage = 0;
    var selectionPosition = 0;
    if (page < 3) {
      selectionPosition = page;
      startPage = 1;
    }
    else if (page == numPages && page != 3 && page != 4) {
      selectionPosition = 5;
      startPage = numPages - 4;
    }
    else if (page == numPages - 1 && page != 3) {
      selectionPosition = 4;
      startPage = numPages - 4;
    }
    else if (page == 4) {
      selectionPosition = 4;
      startPage = page - 3;
    }
    else if (page == 3) {
      selectionPosition = 3;
      startPage = page - 2;
    }
    else {
      selectionPosition = 3;
      startPage = page - 2;
    }

    $("#page"+selectionPosition).addClass("active");
    $("#page"+selectionPosition)[0].page = page;
    var selecta = $("#page" + selectionPosition + " a");
    selecta.text(page);
    selecta.attr("href", "#system-user#page" + page);

    for (var j = 0; j < 5; ++j) {
      var realPage = startPage + j;
      var elementId = "#page" + (j+1);

      $(elementId)[0].page = realPage;
      var a = $(elementId + " a");
      a.text(realPage);
      a.attr("href", "#system-user#page" + realPage);
    }
  },

  handleChangePageSelection: function(evt) {
    if ($(evt.currentTarget).hasClass("disabled")) {
      return;
    }
    var page = evt.currentTarget.page;
    this.model.set({"page": page});
  },

  handleChangeView: function(evt) {
    // if (this.init) {
    //   return;
    // }
    console.log("init");
    this.handlePageChange(evt);
    this.init = true;
  },

  handlePageChange: function(evt) {
    var start = this.model.get("page") - 1;
    var pageSize = this.model.get("pageSize");
    var requestURL = contextURL + "/system";
    var searchterm = this.model.get("searchterm");
    if(!searchterm){
      searchterm="";
    }

    var model = this.model;
    var requestData = {
      "ajax": "findSystemUserPage",
      "start": start,
      "pageSize": pageSize,
      "searchterm": searchterm,
    };
    var successHandler = function(data) {
      model.set({
        "systemUserPageList": data.systemUserPageList,
        "modify": data.modify,
        "total": data.total
      });
      model.trigger("render");
    };
    $.get(requestURL, requestData, successHandler, "json");
  },

  handleUpdateSystemUserBtn: function(evt) {
    console.log("click upload project");

    var userId = evt.currentTarget.name;
    systemUserModel.set({"updateUserId": userId});
    $('#update-system-user-panel').modal();
    updateSystemUserView.render();
    updateSystemUserView.loadWtssUserData();
  },


});

var userOptionsView;
azkaban.UserOptionsView = Backbone.View.extend({
  events: {
    "click #addSystemUser": "handleAddSystemUser",
    "click #syncWebankUserBtn": "handleSyncWebankUser",
    "click #syncXmlUserBtn": "handleXmlUserBtn",
    "click #search-user-btn": "handleSearchUser",
  },

  initialize: function (settings) {
  },

  handleAddSystemUser: function (evt) {
    console.log("click upload project");
    $('#add-system-user-panel').modal();
    addSystemUserView.render();
  },

  handleSyncWebankUser: function (evt) {
    console.log("click webank user sync");
    $('#webank-user-sync-panel').modal();
    webankUserSyncView.render();
  },

  handleXmlUserBtn: function (evt) {
    console.log("click webank user sync");
    var requestURL = contextURL + "/system";

    var requestData = {
      "ajax": "syncXmlUsers",
    };
    var successHandler = function (data) {
      if (data.error) {
        alert(data.error);
        return false;
      } else {
        window.location.href = contextURL + "/system#system-user";
      }
    };
    $.get(requestURL, requestData, successHandler, "json");
  },

  handleSearchUser: function () {
    var searchterm = $('#serarch-user').val();
    systemUserModel.set({"searchterm": searchterm});

    //systemUserModel.trigger("change:page");

    systemTabView.handleSystemUserViewLinkClick();
  },

  render: function () {
  }
});



var addSystemUserView;
azkaban.AddSystemUserView = Backbone.View.extend({
  events: {
    "click #system-user-create-btn": "handleAddSystemUser"
  },

  initialize: function (settings) {
    console.log("Hide modal error msg");
    $("#add-user-modal-error-msg").hide();
    this.loadWebankUserData();
    this.loadWebankDepartmentData();
  },

  handleAddSystemUser: function (evt) {
    console.log("Add System User button.");
    var userId = $("#webank-user-select").val();
    var password = $("#password").val();
    var roleId = $("#user-role-select").val();
    var categoryUser = $("#user-category-select").val();
    var proxyUser = $("#proxy-user").val();
    var departmentId = $("#webank-department-select2").val();
    var requestURL = contextURL + "/system";

    if(null == userId){
      alert(wtssI18n.system.userPro);
      return;
    }

    if("0" == roleId){
      alert(wtssI18n.system.rolePro);
      return;
    }

    if("0" == departmentId){
      alert(wtssI18n.system.departmentPro);
      return;
    }
    if ("0" == categoryUser) {
      alert(wtssI18n.system.userCatePro);
      return;
    }

    var model = this.model;
    var requestData = {
      "ajax": "addSystemUser",
      "userId": userId,
      "password": password,
      "roleId": roleId,
      "proxyUser": proxyUser,
      "departmentId": departmentId,
      "categoryUser":categoryUser
    };
    var successHandler = function (data) {
      if (data.error) {
        $("#add-user-modal-error-msg").show();
        $("#add-user-modal-error-msg").text(data.error.message);
        return false;
      } else {
        window.location.href = contextURL + "/system";
      }
      model.trigger("render");
    };
    $.get(requestURL, requestData, successHandler, "json");
  },

  loadWebankUserData: function () {

    $("#webank-user-select").select2({
      placeholder:wtssI18n.system.userPro,//默认文字提示
      multiple : false,
      width: 'resolve',
      //language: "zh-CN",
      tags: true,//允许手动添加
      //allowClear: true,//允许清空
      escapeMarkup: function (markup) { return markup; }, //自定义格式化防止XSS注入
      minimumInputLengt: 1,//最少输入多少字符后开始查询
      formatResult: function formatRepo(repo){return repo.text;},//函数用来渲染结果
      formatSelection: function formatRepoSelection(repo){return repo.text;},//函数用于呈现当前的选择
      ajax: {
        type: 'GET',
        url: contextURL + "/system",
        dataType: 'json',
        delay: 250,
        data: function (params) {
          var query = {
            ajax: "loadWebankUserSelectData",
            serach: params.term,
            page: params.page || 1,
            pageSize: 20,
          }
          return query;
        },
        processResults: function (data, params) {
          params.page = params.page || 1;
          return {
            results: data.webankUserList,
            pagination: {
              more: (params.page * 20) < data.webankUserTotalCount
            }
          }
        },
        cache:true
      },
      language: 'zh-CN',


    });
  },

  loadWebankDepartmentData:function () {
    var requestURL = contextURL + "/system";
    var requestData = {
      "ajax":"loadWebankDepartmentSelectData",
    };
    var successHandler = function(data) {
      if (data.error) {
        console.log(data.error);
      }
      else {
        var depList = data.webankDepartmentList;
        //每次新增option,需要清空select,避免造成重复数据
        $("#webank-department-select2").find("option:selected").text("");
        $("#webank-department-select2").empty();
        for(var i=0; i<depList.length; i++){
          var department = depList[i];
          $('#webank-department-select2').append("<option value='" + department.dpId + "'>" + department.dpName + "</option>");
        }
      }
    }

    $.ajax({
      url: requestURL,
      type: "get",
      async: false,
      data: requestData,
      dataType: "json",
      error: function(data) {
        console.log(data);
      },
      success: successHandler
    });
  },

  render: function () {
    this.loadWebankDepartmentData();
    $("#add-user-modal-error-msg").hide();
  },
});

var updateSystemUserView;
azkaban.UpdateSystemUserView = Backbone.View.extend({
  events: {
    "click #system-user-update-btn": "handleUpdateSystemUser",
    "click #system-user-delete-btn": "handleDeleteSystemUser"
  },

  initialize: function (settings) {
    console.log("Hide modal error msg");
    $("#update-user-modal-error-msg").hide();
    this.loadWebankDepartmentData();
  },

  handleUpdateSystemUser: function (evt) {
    console.log("Update System User button.");
    var userId = $("#wtss-user-id").val();
    var password = $("#update-password").val();
    var roleId = $("#update-user-role-select").val();
    var proxyUser = $("#update-proxy-user").val();
    var departmentId = $("#update-wtss-department-select").val();
    var requestURL = contextURL + "/system";

    if("0" == roleId){
      alert(wtssI18n.system.rolePro);
      return;
    }

    if("0" == departmentId){
      alert(wtssI18n.system.departmentPro);
      return;
    }

    var model = this.model;
    var requestData = {
      "ajax": "updateSystemUser",
      "userId": userId,
      "password": password,
      "roleId": roleId,
      "proxyUser": proxyUser,
      "departmentId": departmentId,
    };
    var successHandler = function (data) {
      if (data.error) {
        $("#update-user-modal-error-msg").show();
        $("#update-user-modal-error-msg").text(data.error.message);
        return false;
      } else {
        window.location.href = contextURL + "/system";
      }
      model.trigger("render");
    };
    $.get(requestURL, requestData, successHandler, "json");
  },

  handleDeleteSystemUser: function (evt) {
    console.log("Delete System User button.");
    var userId = $("#wtss-user-id").val();
    var requestURL = contextURL + "/system";

    var model = this.model;
    var requestData = {
      "ajax": "deleteSystemUser",
      "userId": userId,
    };
    var successHandler = function (data) {
      if (data.error) {
        $("#update-user-modal-error-msg").show();
        $("#update-user-modal-error-msg").text(data.error.message);
        return false;
      } else {
        window.location.href = contextURL + "/system";
      }
      model.trigger("render");
    };
    $.get(requestURL, requestData, successHandler, "json");
  },

  loadWtssUserData: function () {

    var userId = this.model.get("updateUserId");
    var requestURL = contextURL + "/system";

    var requestData = {
      "ajax": "getSystemUserById",
      "userId": userId,
    };
    var successHandler = function (data) {
      if (data.error) {
        $("#update-user-modal-error-msg").show();
        $("#update-user-modal-error-msg").text(data.error.message);
        return false;
      } else {
        var showUserCategory = "";
        if (data.systemUser.userCategory) {
          if ("ops" == data.systemUser.userCategory) {
            if (data.languageType == "zh_CN") {
              showUserCategory = "运维用户";
            } else {
              showUserCategory = "OPS User";
            }
          }
          if ("system" == data.systemUser.userCategory) {
            if (data.languageType == "zh_CN") {
              showUserCategory = "系统用户";
            } else {
              showUserCategory = "System User";
            }
          }
          if ("personal" == data.systemUser.userCategory) {
            if (data.languageType == "zh_CN") {
              showUserCategory = "实名用户";
            } else {
              showUserCategory = "Real-Name User";
            }
          }
          if ("test" == data.systemUser.userCategory) {
            if (data.languageType == "zh_CN") {
              showUserCategory = "临时测试用户";
            } else {
              showUserCategory = "User for Test";
            }
          }
        }

        $("#wtss-user-id").val(data.systemUser.userId);
        $("#wtss-full-name").val(data.systemUser.fullName);
        $("#wtss-user-category").val(showUserCategory);
        $("#update-password").val(data.systemUser.password);
        $("#update-user-role-select").val(data.systemUser.roleId);
        $("#update-proxy-user").val(data.systemUser.proxyUsers);
        $("#update-wtss-department-select").val(data.systemUser.departmentId);
      }
    };
    $.get(requestURL, requestData, successHandler, "json");

  },

  loadWebankDepartmentData:function () {
    var requestURL = contextURL + "/system";
    var requestData = {
      "ajax":"loadWebankDepartmentSelectData",
    };
    var successHandler = function(data) {
      if (data.error) {
        console.log(data.error.message);
      }
      else {
        var depList = data.webankDepartmentList;
        $("#update-wtss-department-select").find("option:selected").text("");
        $("#update-wtss-department-select").empty();
        for(var i=0; i<depList.length; i++){
          var department = depList[i];
          $('#update-wtss-department-select').append("<option value='" + department.dpId + "'>" + department.dpName + "</option>");
        }
      }
    }

    $.ajax({
      url: requestURL,
      type: "get",
      async: false,
      data: requestData,
      dataType: "json",
      error: function(data) {
        console.log(data);
      },
      success: successHandler
    });
  },

  render: function () {
    $("#update-user-modal-error-msg").hide();
  },
});


var webankUserSyncView;
azkaban.WebankUserSyncView = Backbone.View.extend({
  events: {
    "click #webank-user-sync-btn": "handleWebankUserSync",
  },

  initialize: function (settings) {
    $("#webank-user-sync-error-msg").hide();
    $("#webank-user-sync-success-msg").hide();
  },

  handleWebankUserSync: function (evt) {
    //console.log("click webank user sync");
    //$('#webank-user-sync-panel').modal();

    $('#webank-user-sync-progress').prop("class","flow-progress-bar main-progress RUNNING");

    var requestData = {
      "ajax": "syncWebankUsers",
    };
    var successHandler = function(data) {
      if(data.error){
        $("#webank-user-sync-error-msg").show();
        $("#webank-user-sync-error-msg").text(data.error);
        $('#webank-user-sync-progress').prop("class","flow-progress-bar main-progress FAILED");
      } else {
        $("#webank-user-sync-success-msg").show();
        $("#webank-user-sync-success-msg").text(data.message);
        $('#webank-user-sync-progress').prop("class","flow-progress-bar main-progress SUCCEEDED");
      }

    };
    $.get(contextURL, requestData, successHandler, "json");

  },

  render: function () {
    $("#webank-user-sync-error-msg").hide();
    $("#webank-user-sync-success-msg").hide();
    $('#webank-user-sync-progress').prop("class","");
  },

});

