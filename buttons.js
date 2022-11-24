/*
 * Copyright 2019 Abakkk
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-FileCopyrightText: 2019 Abakkk
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* jslint esversion: 6 */
/* exported DrawingHelper */

const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Shortcuts = Me.imports.shortcuts;
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;
const Files = Me.imports.files;

const GS_VERSION = Config.PACKAGE_VERSION;
const Tweener = GS_VERSION < '3.33.0' ? imports.ui.tweener : null;

const BUTTONS_ANIMATION_TIME = 0.25;
const UUID = Me.uuid.replace(/@/gi, '_at_').replace(/[^a-z0-9+_-]/gi, '_');

var DrawingButtons = GObject.registerClass({
    GTypeName: `${UUID}-DrawingButtons`,
    Signals: { 'open-menu': {}, 'leave-drawing-mode': {} },
}, class DrawingButtons extends St.ScrollView {
    
    _init(params, monitor) {
        params.style_class = 'osd-window draw-on-your-screen-buttons';
        super._init(params);
        this.monitor = monitor;
        this.height = 50;
        this.width = 100;
    }
    
    _populate() {
        this.vbox = new St.BoxLayout({ vertical: false });
        this.add_actor(this.vbox);
        // Exit (stop drawing) button
        let exitButton = new St.Button();
        exitButton.set_child(new St.Icon({
            gicon: Files.Icons.LEAVE,
            style_class: 'draw-on-your-screen-button-icon'
        }))
        exitButton.connect('clicked', () => {
            this.emit('leave-drawing-mode');
        });
        // Menu button
        let menuButton = new St.Button();
        menuButton.set_child(new St.Icon({
            gicon: Files.Icons.OPEN_MENU,
            style_class: 'draw-on-your-screen-button-icon'
        }))
        menuButton.connect('clicked', () => {
            this.emit('open-menu');
        });
        this.vbox.add_child(exitButton);
        this.vbox.add_child(menuButton);
    }
    
    showButtons() {
        if (!this.vbox)
            this._populate();
        
        this.opacity = 0;
        this.show();
        
        this.set_position(Math.floor(this.monitor.width - this.width),
                          Math.floor(this.monitor.height - this.height));
                          
        // St.PolicyType: GS 3.32+
        this.vscrollbar_policy = St.PolicyType ? St.PolicyType.NEVER : Gtk.PolicyType.NEVER;
        this.hscrollbar_policy = St.PolicyType ? St.PolicyType.NEVER : Gtk.PolicyType.NEVER;
        
        if (Tweener) {
            Tweener.removeTweens(this);
            Tweener.addTween(this, { opacity: 255,
                                     time: BUTTONS_ANIMATION_TIME,
                                     transition: 'easeOutQuad' });
        } else {
            this.remove_all_transitions();
            this.ease({ opacity: 255,
                        duration: BUTTONS_ANIMATION_TIME * 1000,
                        transition: Clutter.AnimationMode.EASE_OUT_QUAD });
        }
    }
});

