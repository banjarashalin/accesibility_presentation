/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define([
    'apps/navbar/menu/main',
    './views/menu_list_view',
    './models/menu_source'
], function(NavbarMenu, MenuListView, MenuSource) {
    return NavbarMenu.extend(function(protect, _super) {

        this.init = function(options) {
            this.options = options;
            this.customListView = new MenuListView(options);
            this.customItemSource = new MenuSource(options);
            
            this.customItemSource.addListener('reputationLoaded', this.customListView.showReputationPoints);
            this.customItemSource.loadData();
            
            _super.init.call(this, options.buttonSelector, options.menuSelector);
        };

        this.buildListView = function (buttonSelector, menuSelector) {
            return this.customListView;
        };  

        this.buildItemSource = function() {
            return this.customItemSource;
        };  

    });
});

