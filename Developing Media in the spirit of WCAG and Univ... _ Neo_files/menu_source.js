/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define([
    'apps/shared/models/rest_service',
    'jiverscripts/conc/observable',
    'jiverscripts/conc/promise',
    'jiverscripts/conc/synchronize',
    '../../shared/models/userService',
    '../../../lib/nitro/Nitro',
    '../../../lib/n4jive/profile'
], function(RestService, observable, Promise, synchronize, UserService, Nitro, Profile) {
    return RestService.extend(function(protect, _super) {
        
        observable(this);
        
        this.init = function(options) {
            _super.init.call(this, options);
            this.options = options;
            
            this.renderPromise = new Promise();
            this.findPromise = new Promise();
            this.resultPromise = new Promise();
            
            var self = this;
            
            this.synchronizer = synchronize({
                render: this.renderPromise,
                find: this.findPromise
            }).addCallback(function(promises) {
                self.resultPromise.emitSuccess(promises.render);
            });
        };
        
        this.findAll = function() {
            this.findPromise.emitSuccess();
            
            return this.resultPromise;
        };
        
        this.loadData = function() {
            var self = this;
            
            var nitro = new Nitro({
                apiKey: this.options.apiKey,
                timeStamp: this.options.timeStamp,
                signature: this.options.signature,
                server: this.options.server,
                userId: this.options.userID,
                localizationEnabled: this.options.localizationEnabled
            });
            
            var profile = new Profile(nitro, {
                toGoText: 'to go', 
                levelText: 'Level', 
                nextLevelText: 'Next Level', 
                nextMissionText: 'Next Mission',
                i18n: this.options.i18n,
                moreText: 'More',
                moreLinkUrl: this.options.reputationCenterUrl,
                profileService: new UserService({}),
                renderCallback: function(renderedMenu, data) {
                    self.renderPromise.emitSuccess(renderedMenu);
                    self.emit('reputationLoaded', data);
                }
            });
        };
        
    });
});
