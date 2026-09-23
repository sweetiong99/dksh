/****************************************************************************
 Valid params value for read and create functions:-
 sModelName     : To set the data into the model.
 aRecCount      : To set total record into the COUNT attribute of the model.
 aFilterValues  : To set baceknd query filter.
 sUiMsg         : To display message from i18n or backend.

Example:
var params = {
    sModelName: LOCAL_MODELS.CONTRACT_LIST,
    aRecCount: ["DATA"],
    aFilterValues: aFilterValues,
    sUiMsg: "i18n-property" or "backend" (any text if message from backend)
};
*****************************************************************************/
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
    "use strict";
    return Object.extend("com.test.project02.view.js.ODataAPI", {
        constructor: function (controller, sModelName) {
            if (sModelName != undefined)
                this.model = controller.getOwnerComponent().getModel(sModelName);
            else
                this.model = controller.getOwnerComponent().getModel();
            
            this.controller = controller;
        },

        returnData: function(resolve, reject, params){
            var oParameters = {
                success: function(oData, oResponse) {
                    if (!!params) {
                        if (!!params.sModelName) {
                            var oContext = oData.results;
                            if (!!oContext && !!params.aRecCount) {
                                var totalRec = 0;
                                for (var i=0; i<params.aRecCount.length; i++) {
                                    if (!!oContext[params.aRecCount[i]]) {
                                        totalRec = oContext[params.aRecCount[i]].length;
                                        oContext[params.aRecCount[i]].COUNT = totalRec;
                                    }
                                }
                            }
                            var jModel = new JSONModel(oContext);
                            this.controller.setModel(jModel, params.sModelName);
                        }

                        if (!!params.sUiMsg) {
                            const sMsg = JSON.parse(oData.MSG);
                            sMsg.length > 0 ? this.controller.showReturMessage(oData.MSG, params.sUiMsg) : this.controller.MBoxSuccess(this.controller.getResourceBundleProp(params.sUiMsg));
                        }
                    }

                    sap.ui.core.BusyIndicator.hide();

                    var oMsgModel = sap.ui.getCore().getMessageManager().getMessageModel();
                    var aMessages = oMsgModel.getData();

                    if (aMessages.length > 0) {
                        aMessages.forEach(function(oMsg) {
                            sap.m.MessageToast.show(oMsg.message);
                        });

                        // Clear all message after each operation
                        sap.ui.getCore().getMessageManager().removeAllMessages();
                    }

                    var oRes;
                    if (oResponse.headers['sap-message']) {
                        oRes = JSON.parse(oResponse.headers['sap-message']);
                    }
                    resolve(oRes);
                }.bind(this),
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    this.controller.errorShow(oError);
                    reject(oError);
                }.bind(this)
            }

            if (!!params){
                if (!!params.aFilterValues) {
                    var aFilterIds = ["CONTEXT"];
                    var aFilters = this.controller._createSearchFilterObject(aFilterIds, params.aFilterValues);
                    oParameters.filters = aFilters;
                }
            }

            return oParameters;
        },
        create: function(sPath, payload, params){
            return new Promise(function(resolve, reject){
                sap.ui.core.BusyIndicator.show(0);
                this.model.create(sPath, payload, this.returnData(resolve, reject, params));
            }.bind(this));
        },
        update: function(sPath, payload, params){
            return new Promise(function(resolve, reject){
                sap.ui.core.BusyIndicator.show(0);
                var oParameters = this.returnData(resolve, reject, params);
                oParameters.method = "MERGE";

                this.model.update(sPath, payload, oParameters);
            }.bind(this));
        },
        delete: function(sPath, params){
            return new Promise(function(resolve, reject){
                sap.ui.core.BusyIndicator.show(0);
                var oParameters = this.returnData(resolve, reject, params);
                this.model.setUseBatch(false);
                this.model.remove(sPath, oParameters);
            }.bind(this));
        },
        read: function(sPath, params) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);
                this.model.read(sPath, this.returnData(resolve, reject, params));
            }.bind(this));
        }
    });
});