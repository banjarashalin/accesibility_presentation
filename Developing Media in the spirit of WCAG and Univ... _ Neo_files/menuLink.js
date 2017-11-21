// This file was automatically generated from menuLink.soy.
// Please don't edit this file by hand.

goog.provide('jive.nitro.reputationMenu.menuLink');

goog.require('soy');
goog.require('soydata');
goog.require('soy.StringBuilder');


jive.nitro.reputationMenu.menuLink = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="reputation-spacer" style="display: none;"></div><div id="reputation-menu-link" style="display: none;"><a href="#" class="j-globalNavLink reputation-points-loading" id="navReputationCenter" title="', soy.$$escapeHtml(jive.i18n._i18n('f92b9d',[])), '">', soy.$$escapeHtml(jive.i18n._i18n('f92b9d',[])), '</a></div><div id="menuReputationCenter" class="j-quick-menu" style="display: none"></div>');
  return opt_sb ? '' : output.toString();
};
