sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/test/project02/view/js/ODataAPI"
],
function (Controller, ODataAPI) {
    "use strict";

    return Controller.extend("com.test.project02.controller.View1", {
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("MainModel");

            var oMessageManager = sap.ui.getCore().getMessageManager();
            this.getView().setModel(oMessageManager.getMessageModel(), "message");
            oMessageManager.registerObject(this.getView(), true);

            this.oDataAPI = new ODataAPI(this, "MainModel");
        },

        onDetails: function (oEvent) {
            var path = oEvent.getSource().getBindingContext("MainModel").getPath();
            var data = this.getModel("MainModel").getProperty(path);
     
            var oFlexCol = this.getView().byId("idFlexColProj");
            oFlexCol.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
            this.getView().byId("btnExitFullScreen").setProperty("visible", false);
        },

        onEdit: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("MainModel");
            var oCustomer = oContext.getProperty("TravelToCustomerNav");

            this.getView().byId("frmTravel").setBindingContext(oContext, "MainModel");
            this.getView().byId("txtCustomer").setText(oCustomer.FirstName + " " + oCustomer.LastName);

            var oFlexCol = this.getView().byId("idFlexColProj");
            oFlexCol.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
            this.getView().byId("btnExitFullScreen").setProperty("visible", false);
        },

        onAdd: function (oEvent) {
            var oModel = this.getView().getModel("MainModel");

            var oContext = oModel.createEntry("/TravelSet", {
                properties: {
                    Id: "",
                    Name: "",
                    Age: ""
                }
            });

            this.getView().byId("frmTravel").setBindingContext(oContext, "MainModel");

            var oFlexCol = this.getView().byId("idFlexColProj");
            oFlexCol.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
            this.getView().byId("btnExitFullScreen").setProperty("visible", false);
        },
      
        onCloseSideScreen: function (oEvent) {
            var oFlexCol = this.getView().byId("idFlexColProj");
            oFlexCol.setLayout(sap.f.LayoutType.OneColumn);
        },

        onHandleFullScreen: function() {
			this.byId("btnExitFullScreen").setProperty("visible", true);
			this.byId("btnFullScreen").setProperty("visible", false);
			this.byId('idFlexColProj').setLayout(sap.f.LayoutType.MidColumnFullScreen);
        },

		onHandleExitFullScreen: function() {
			this.getView().byId("btnExitFullScreen").setProperty("visible", false);
			this.getView().byId("btnFullScreen").setProperty("visible", true);
			this.byId('idFlexColProj').setLayout(sap.f.LayoutType.TwoColumnsMidExpanded);
		},  

        onDelete: function (oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext("MainModel");
            var payload = oContext.getObject();
            delete payload.TravelToCustomerNav;
			var sPath = "/TravelSet(TravelId='" + payload.TravelId + "',CustomerId='" + payload.CustomerId + "')";

            var oModel = this.getOwnerComponent().getModel("MainModel");

            var oParameters = {
                success: function () {
                    sap.m.MessageToast.show("Saved");
                    that.onCloseSideScreen();
                },
                error: function () {
                    sap.m.MessageToast.show("Save failed");
                }
            }

            oModel.remove(sPath, oParameters);
            oModel.refresh(true);
        },

        onClearFilter: function (oEvent, tableId) {
			this.clearFilterUITable(tableId);
        },

        onRefresh: function (oEvent) {
            this._getTravelList();
        },

        onSaveTravel: function() {
            var that = this;
            var oContext = this.getView().byId("frmTravel").getBindingContext("MainModel");
            var payload = oContext.getObject();
            delete payload.TravelToCustomerNav;
			var sPath = "/TravelSet(TravelId='" + payload.TravelId + "',CustomerId='" + payload.CustomerId + "')";

            var oModel = this.getOwnerComponent().getModel("MainModel");

            if (payload.TravelId && payload.TravelId.length > 0) {
                var sPath = "/TravelSet(TravelId='" + payload.TravelId + "',CustomerId='" + payload.CustomerId + "')";
                this.oDataAPI.update(sPath, payload, oParameters); 

                /*
                var oParameters = {
                    merge: true,
                    success: function () {
                        var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
                        var aMessages = oMessageModel.getData();
                        if (aMessages.length > 0) {
                            sap.m.MessageBox.success(aMessages[0].message);
                            // sap.m.MessageToast.show(aMessages[0].message);
                        } else {
                            sap.m.MessageToast.show("Saved");
                        }

                        that.onCloseSideScreen();
                    },
                    error: function () {
                        var oMessageModel = sap.ui.getCore()
                            .getMessageManager()
                            .getMessageModel();

                        var aMessages = oMessageModel.getData();
                        if (aMessages.length > 0) {
                            sap.m.MessageBox.error(aMessages[0].message);
                        } else {
                            sap.m.MessageToast.show("Saved failed");
                        }
                    }
                }

                oModel.update(sPath, payload, oParameters); */
            } else {
                var sPath = "/TravelSet";
                var oParameters = {
                    success: function () {
                        sap.m.MessageToast.show("Saved");
                        that.onCloseSideScreen();
                    },
                    error: function () {
                        sap.m.MessageToast.show("Save failed");
                    }
                }

                oModel.create(sPath, payload, oParameters);
            }

            oModel.refresh(true);
		},

        createTravel: function() {
            var payload = this.controller.getModel("TRAVEL_DET").getData();
			var sPath = "/TravelSet";
			var params = {
				sUiMsg: ""
			};

			//return this.getODataAPI2().delete(sPath, params);
            this.oModel = this.controller.getOwnerComponent().getModel("MainModel");

            return new Promise(function(resolve, reject){
                sap.ui.core.BusyIndicator.show(0);
                this.oModel.create(sPath, payload, this.api.returnData(resolve, reject, params));
            }.bind(this));
		},

        onSave: function(oEvent) {
            this.getView()
            .getModel("MainModel")
            .submitChanges({
                success: function () {
                    sap.m.MessageToast.show("Saved");
                },
                error: function () {
                    sap.m.MessageToast.show("Save failed");
                }
            });
            /*
            var payload = this.getModel("TRAVEL_DET").getData();
            if (payload.TravelId) {
                this.oTravelService.saveTravel();
            } else {
                this.oTravelService.createTravel();
            }
            */
        }
    });
});
