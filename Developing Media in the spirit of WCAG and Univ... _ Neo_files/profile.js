
define([
    'jquery',
    './n4jive.core',
    './nitro4x.user_widget'
], function($, n4jive, UserWidgetHTMLBuilder){
    return function(nitro, options) {
        
        var self = this;
        var localeString = n4jive.localeString(nitro.connectionParams.localizationEnabled);

        this.options = {},
        this.parent = n4jive,
        this.sessionKey = '',
        this.serverUrl = '',
        this.profileService = function(){ },
        this.loadingCallback = null, // Callback to remove the loading icons
        
        this.defaults = {
            target: '',
            toGoText: 'to go',
            levelText: 'Level',
            nextLevelText: 'Next Level',
            nextMissionText: 'Next Mission',
            moreLinkText: 'More'
        },
        
        this.userId = '',
        this.balance = 0,
        this.pointCategory = '',
        this.level = '',
        this.curLevelPoints = 0,
        this.nextLevel = '',
        this.nextLevelPoints = 0,
        this.nextChallenge = null,
        this.nitroLoaded = false,
        
        /**
         * Initializes the widget
         * @param {Object} nitro - a nitro javascript object
         * @param {Object} options - a dictionary of different options for this widget
         */
        this.init = function(nitro, options) {
            var self = this;
            self.options = $.extend({}, self.defaults, options);
            self.sessionKey = nitro.connectionParams.sessionKey;
            self.serverUrl = nitro.connectionParams.server + '?sessionKey=' + nitro.connectionParams.sessionKey + '&jsCallback=?';
            self.userId = nitro.connectionParams.userId;
            self.profileService = n4jive.getOption('profileService', self);
            //self.loadingCallback = n4jive.workingFactory($(self.options.target));
            
            self.loadData();
        },
        
        this.loadData = function() {
            var self = this;
            
            try {
                var methodString = '[';
                methodString += '"method=user.getPointsBalance&criteria=CREDITS&sessionKey=' + self.sessionKey + localeString + '",';
                methodString += '"method=user.getLevel&sessionKey=' + self.sessionKey + localeString + '",';
                methodString += '"method=user.getNextLevel&sessionKey=' + self.sessionKey + '",';
                methodString += '"method=user.getNextChallenge&sessionKey=' + self.sessionKey + '"]';
                
                $.getJSON(self.serverUrl + '&method=batch.run&methodFeed=' + encodeURIComponent(methodString), function(data) {
                    for (var i = 0; i < data.Nitro.Nitro.length; i++) {
                        var apiResponse = data.Nitro.Nitro[i];

                        switch (apiResponse.method) {
                            case 'user.getPointsBalance':
                                self.balance = parseInt(apiResponse.Balance.lifetimeBalance, 10);
                                var pointCategories = self.parseResponseArray(apiResponse.Balance.pointCategories.PointCategory);
                                for (var j = 0; j < pointCategories.length; j++) {
                                    if (pointCategories[j].isDefault) self.pointCategory = pointCategories[j].name;
                                }
                                break;
                            case 'user.getLevel':
                                self.level = apiResponse.users.User.SiteLevel.name;
                                self.curLevelPoints = parseInt(apiResponse.users.User.SiteLevel.points, 10);
                                break;
                            case 'user.getNextLevel':
                                self.nextLevel = apiResponse.users.User.SiteLevel;
                                break;
                            case 'user.getNextChallenge':
                                self.nextChallenge = apiResponse.challenges.Challenge;
                                break;
                        }
                    }
                    
                    // Now that we have all the data set up...
                    self.nitroLoaded = true;
                    self.populateHTML();
                });
            }
            catch (err) {
                console.error('Error loading data from Nitro: ' + err);
            }
            
        },
        
        this.parseResponseArray = function(obj) {
            if (typeof obj == 'undefined') obj = [];
            if (typeof obj.length == 'undefined') obj = [obj];
            return obj;
        },
        
        this.populateHTML = function() {
            if (!this.nitroLoaded) return;
            
            var profileData = {};
            profileData.yourStatusText = this.options.i18n.yourStatusText;
            profileData.button_text = this.options.moreLinkText;
            profileData.button_url = this.options.moreLinkUrl;
            profileData.unit = {units: this.balance, name: this.pointCategory, text: this.options.toGoText};
            profileData.level = {level: this.level, name: this.options.levelText, units: this.curLevelPoints};
            profileData.i18n = this.options.i18n;
            
            profileData.next_level = {name: this.options.nextLevelText, emptyText: this.options.i18n.emptyNextLevelText};
            if (this.nextLevel) {
                var nextLevelPoints = parseInt(this.nextLevel.points, 10);
                $.extend(profileData.next_level, {unit: this.pointCategory, units_next: nextLevelPoints, units_next_to_go: nextLevelPoints - this.balance, level: this.nextLevel.name});
            }
            
            profileData.mission = {name: this.options.nextMissionText, emptyText: this.options.i18n.emptyNextMissionText};
            if (this.nextChallenge) {
                var reward = (this.nextChallenge.pointAward < 0) ? this.nextChallenge.pointAward : '+' + this.nextChallenge.pointAward;
                $.extend(profileData.mission, {unit: this.pointCategory, reward: reward, mission: this.nextChallenge.name, img: this.nextChallenge.thumbUrl});
            }
            
            var htmlBuilder = new UserWidgetHTMLBuilder();
            self.options.renderCallback(htmlBuilder.draw_user_widget(profileData), profileData);
        };
        
        
        
        /*******************************************************************
         WAIT FOR NITRO TO COME BACK WITH A SESSION KEY BEFORE INITIALIZING
        *******************************************************************/
        //if we havent gotten a session key, keep waiting for awhile to make sure the user.login call has come back ok
        if(typeof(nitro) == "undefined" || nitro.connectionParams.sessionKey === null){
            var initialize = setInterval(function(){
                if(typeof(nitro) != "undefined" && nitro.connectionParams.sessionKey !== null){
                    clearInterval(initialize);
                    self.init(nitro, options);
                }
            },500);
        }else{
            //initialize
            self.init(nitro, options);
        }
        
    };
});
