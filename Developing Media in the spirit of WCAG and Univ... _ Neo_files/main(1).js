/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define([
    'jquery',
    'jiverscripts/oo/class',
    './views/menu_view'
], function($,Class, MenuView) {
    return Class.extend(function(protect, _super) {

        this.init = function(options) {
            this.view = new MenuView(options);
            
            this.view.addListener('viewReady', function() {
                require([
                    'plugins/gamification/resources/script/apps/reputationMenu/menu'
                ], function(ReputationMenu) {
                    new ReputationMenu($.extend({}, options, {
                        buttonSelector: '#navReputationCenter', 
                        menuSelector: '#menuReputationCenter'
                    }));
                });
            });
        };
    });
});
