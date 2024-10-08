(function (root, factory) {
    if (typeof define === "function" && define.amd && typeof require === "function" && typeof require.specified === "function" && require.specified("knockout")) {
        define(["jquery", "knockout"], factory)
    } else {
        factory(root.jQuery, root.ko)
    }
})(this, function ($, ko) {
    "use strict";
    if (typeof ko !== "undefined" && ko.bindingHandlers && !ko.bindingHandlers.multiselect) {
        ko.bindingHandlers.multiselect = {
            after: ["options", "value", "selectedOptions", "enable", "disable"],
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var $element = $(element);
                var config = ko.toJS(valueAccessor());
                $element.multiselect(config);
                if (allBindings.has("options")) {
                    var options = allBindings.get("options");
                    if (ko.isObservable(options)) {
                        ko.computed({
                            read: function () {
                                options();
                                setTimeout(function () {
                                    var ms = $element.data("multiselect");
                                    if (ms) ms.updateOriginalOptions();
                                    $element.multiselect("rebuild")
                                }, 1)
                            }, disposeWhenNodeIsRemoved: element
                        })
                    }
                }
                if (allBindings.has("value")) {
                    var value = allBindings.get("value");
                    if (ko.isObservable(value)) {
                        ko.computed({
                            read: function () {
                                value();
                                setTimeout(function () {
                                    $element.multiselect("refresh")
                                }, 1)
                            }, disposeWhenNodeIsRemoved: element
                        }).extend({rateLimit: 100, notifyWhenChangesStop: true})
                    }
                }
                if (allBindings.has("selectedOptions")) {
                    var selectedOptions = allBindings.get("selectedOptions");
                    if (ko.isObservable(selectedOptions)) {
                        ko.computed({
                            read: function () {
                                selectedOptions();
                                setTimeout(function () {
                                    $element.multiselect("refresh")
                                }, 1)
                            }, disposeWhenNodeIsRemoved: element
                        }).extend({rateLimit: 100, notifyWhenChangesStop: true})
                    }
                }
                var setEnabled = function (enable) {
                    setTimeout(function () {
                        if (enable) $element.multiselect("enable"); else $element.multiselect("disable")
                    })
                };
                if (allBindings.has("enable")) {
                    var enable = allBindings.get("enable");
                    if (ko.isObservable(enable)) {
                        ko.computed({
                            read: function () {
                                setEnabled(enable())
                            }, disposeWhenNodeIsRemoved: element
                        }).extend({rateLimit: 100, notifyWhenChangesStop: true})
                    } else {
                        setEnabled(enable)
                    }
                }
                if (allBindings.has("disable")) {
                    var disable = allBindings.get("disable");
                    if (ko.isObservable(disable)) {
                        ko.computed({
                            read: function () {
                                setEnabled(!disable())
                            }, disposeWhenNodeIsRemoved: element
                        }).extend({rateLimit: 100, notifyWhenChangesStop: true})
                    } else {
                        setEnabled(!disable)
                    }
                }
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $element.multiselect("destroy")
                })
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var $element = $(element);
                var config = ko.toJS(valueAccessor());
                $element.multiselect("setOptions", config);
                $element.multiselect("rebuild")
            }
        }
    }

    function forEach(array, callback) {
        for (var index = 0; index < array.length; ++index) {
            callback(array[index], index)
        }
    }

    function Multiselect(select, options) {
        this.$select = $(select);
        this.options = this.mergeOptions($.extend({}, options, this.$select.data()));
        if (this.$select.attr("data-placeholder")) {
            this.options.nonSelectedText = this.$select.data("placeholder")
        }
        this.originalOptions = this.$select.clone()[0].options;
        this.query = "";
        this.searchTimeout = null;
        this.lastToggledInput = null;
        this.options.multiple = this.$select.attr("multiple") === "multiple";
        this.options.onChange = $.proxy(this.options.onChange, this);
        this.options.onSelectAll = $.proxy(this.options.onSelectAll, this);
        this.options.onDeselectAll = $.proxy(this.options.onDeselectAll, this);
        this.options.onDropdownShow = $.proxy(this.options.onDropdownShow, this);
        this.options.onDropdownHide = $.proxy(this.options.onDropdownHide, this);
        this.options.onDropdownShown = $.proxy(this.options.onDropdownShown, this);
        this.options.onDropdownHidden = $.proxy(this.options.onDropdownHidden, this);
        this.options.onInitialized = $.proxy(this.options.onInitialized, this);
        this.options.onFiltering = $.proxy(this.options.onFiltering, this);
        this.buildContainer();
        this.buildButton();
        this.buildDropdown();
        this.buildReset();
        this.buildSelectAll();
        this.buildDropdownOptions();
        this.buildFilter();
        this.updateButtonText();
        this.updateSelectAll(true);
        if (this.options.enableClickableOptGroups && this.options.multiple) {
            this.updateOptGroups()
        }
        this.options.wasDisabled = this.$select.prop("disabled");
        if (this.options.disableIfEmpty && $("option", this.$select).length <= 0) {
            this.disable()
        }
        this.$select.wrap('<span class="multiselect-native-select" />').after(this.$container);
        this.$select.prop("tabindex", "-1");
        if (this.options.widthSynchronizationMode !== "never") {
            this.synchronizeButtonAndPopupWidth()
        }
        this.options.onInitialized(this.$select, this.$container)
    }

    Multiselect.prototype = {
        defaults: {
            buttonText: function (selectedOptions, select) {
                if (this.disabledText.length > 0 && select.prop("disabled")) {
                    return this.disabledText
                } else if (selectedOptions.length === 0) {
                    return this.nonSelectedText
                } else if (this.allSelectedText && selectedOptions.length === $("option", $(select)).length && $("option", $(select)).length !== 1 && this.multiple) {
                    if (this.selectAllNumber) {
                        return this.allSelectedText + " (" + selectedOptions.length + ")"
                    } else {
                        return this.allSelectedText
                    }
                } else if (this.numberDisplayed != 0 && selectedOptions.length > this.numberDisplayed) {
                    return selectedOptions.length + " " + this.nSelectedText
                } else {
                    var selected = "";
                    var delimiter = this.delimiterText;
                    selectedOptions.each(function () {
                        var label = $(this).attr("label") !== undefined ? $(this).attr("label") : $(this).text();
                        selected += label + delimiter
                    });
                    return selected.substr(0, selected.length - this.delimiterText.length)
                }
            },
            buttonTitle: function (options, select) {
                if (options.length === 0) {
                    return this.nonSelectedText
                } else {
                    var selected = "";
                    var delimiter = this.delimiterText;
                    options.each(function () {
                        var label = $(this).attr("label") !== undefined ? $(this).attr("label") : $(this).text();
                        selected += label + delimiter
                    });
                    return selected.substr(0, selected.length - this.delimiterText.length)
                }
            },
            checkboxName: function (option) {
                return false
            },
            optionLabel: function (element) {
                return $(element).attr("label") || $(element).text()
            },
            optionClass: function (element) {
                return $(element).attr("class") || ""
            },
            onChange: function (option, checked) {
            },
            onDropdownShow: function (event) {
            },
            onDropdownHide: function (event) {
            },
            onDropdownShown: function (event) {
            },
            onDropdownHidden: function (event) {
            },
            onSelectAll: function () {
            },
            onDeselectAll: function () {
            },
            onInitialized: function ($select, $container) {
            },
            onFiltering: function ($filter) {
            },
            enableHTML: false,
            buttonClass: "form-select",
            inheritClass: false,
            buttonWidth: "auto",
            buttonContainer: '<div class="btn-group" />',
            dropRight: false,
            dropUp: false,
            selectedClass: "active",
            maxHeight: false,
            includeSelectAllOption: false,
            includeSelectAllIfMoreThan: 0,
            selectAllText: " Select all",
            selectAllValue: "multiselect-all",
            selectAllName: false,
            selectAllNumber: true,
            selectAllJustVisible: true,
            enableFiltering: false,
            enableCaseInsensitiveFiltering: false,
            enableFullValueFiltering: false,
            enableClickableOptGroups: false,
            enableCollapsibleOptGroups: false,
            collapseOptGroupsByDefault: false,
            filterPlaceholder: "Search",
            filterBehavior: "text",
            includeFilterClearBtn: true,
            preventInputChangeEvent: false,
            nonSelectedText: "None selected",
            nSelectedText: "selected",
            allSelectedText: "All selected",
            numberDisplayed: 3,
            disableIfEmpty: false,
            disabledText: "",
            delimiterText: ", ",
            includeResetOption: false,
            includeResetDivider: false,
            resetText: "Reset",
            indentGroupOptions: true,
            widthSynchronizationMode: "never",
            buttonTextAlignment: "center",
            templates: {
                button: '<button type="button" class="multiselect dropdown-toggle"data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',
                popupContainer: '<div class="multiselect-container dropdown-menu"></div>',
                filter: '<div class="multiselect-filter d-flex align-items-center"><i class="fas fa-sm fa-search text-muted"></i><input type="search" class="multiselect-search form-control" /></div>',
                option: '<button type="button" class="multiselect-option dropdown-item"></button>',
                divider: '<div class="dropdown-divider"></div>',
                optionGroup: '<button type="button" class="multiselect-group dropdown-item"></button>',
                resetButton: '<div class="multiselect-reset text-center p-2"><button type="button" class="btn btn-sm btn-block btn-outline-secondary"></button></div>'
            }
        }, constructor: Multiselect, buildContainer: function () {
            this.$container = $(this.options.buttonContainer);
            if (this.options.widthSynchronizationMode !== "never") {
                this.$container.on("show.bs.dropdown", $.proxy(function () {
                    this.synchronizeButtonAndPopupWidth();
                    this.options.onDropdownShow()
                }, this))
            } else {
                this.$container.on("show.bs.dropdown", this.options.onDropdownShow)
            }
            this.$container.on("hide.bs.dropdown", this.options.onDropdownHide);
            this.$container.on("shown.bs.dropdown", this.options.onDropdownShown);
            this.$container.on("hidden.bs.dropdown", this.options.onDropdownHidden)
        }, buildButton: function () {
            this.$button = $(this.options.templates.button).addClass(this.options.buttonClass);
            if (this.$select.attr("class") && this.options.inheritClass) {
                this.$button.addClass(this.$select.attr("class"))
            }
            if (this.$select.prop("disabled")) {
                this.disable()
            } else {
                this.enable()
            }
            if (this.options.buttonWidth && this.options.buttonWidth !== "auto") {
                this.$button.css({width: "100%"});
                this.$container.css({width: this.options.buttonWidth})
            }
            if (this.options.buttonTextAlignment) {
                switch (this.options.buttonTextAlignment) {
                    case"left":
                        this.$button.addClass("text-left");
                        break;
                    case"center":
                        this.$button.addClass("text-center");
                        break;
                    case"right":
                        this.$button.addClass("text-right");
                        break
                }
            }
            var tabindex = this.$select.attr("tabindex");
            if (tabindex) {
                this.$button.attr("tabindex", tabindex)
            }
            this.$container.prepend(this.$button)
        }, buildDropdown: function () {
            this.$popupContainer = $(this.options.templates.popupContainer);
            if (this.options.dropRight) {
                this.$container.addClass("dropright")
            } else if (this.options.dropUp) {
                this.$container.addClass("dropup")
            }
            if (this.options.maxHeight) {
                this.$popupContainer.css({
                    "max-height": this.options.maxHeight + "px",
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                })
            }
            if (this.options.widthSynchronizationMode !== "never") {
                this.$popupContainer.css("overflow-x", "hidden")
            }
            this.$popupContainer.on("touchstart click", function (e) {
                e.stopPropagation()
            });
            this.$container.append(this.$popupContainer)
        }, synchronizeButtonAndPopupWidth: function () {
            if (!this.$popupContainer || this.options.widthSynchronizationMode === "never") {
                return
            }
            var buttonWidth = this.$button.outerWidth();
            switch (this.options.widthSynchronizationMode) {
                case"always":
                    this.$popupContainer.css("min-width", buttonWidth);
                    this.$popupContainer.css("max-width", buttonWidth);
                    break;
                case"ifPopupIsSmaller":
                    this.$popupContainer.css("min-width", buttonWidth);
                    break;
                case"ifPopupIsWider":
                    this.$popupContainer.css("max-width", buttonWidth);
                    break
            }
        }, buildDropdownOptions: function () {
            this.$select.children().each($.proxy(function (index, element) {
                var $element = $(element);
                var tag = $element.prop("tagName").toLowerCase();
                if ($element.prop("value") === this.options.selectAllValue) {
                    return
                }
                if (tag === "optgroup") {
                    this.createOptgroup(element)
                } else if (tag === "option") {
                    if ($element.data("role") === "divider") {
                        this.createDivider()
                    } else {
                        this.createOptionValue(element, false)
                    }
                }
            }, this));
            $(this.$popupContainer).off("change", '> *:not(.multiselect-group) input[type="checkbox"], > *:not(.multiselect-group) input[type="radio"]');
            $(this.$popupContainer).on("change", '> *:not(.multiselect-group) input[type="checkbox"], > *:not(.multiselect-group) input[type="radio"]', $.proxy(function (event) {
                var $target = $(event.target);
                var checked = $target.prop("checked") || false;
                var isSelectAllOption = $target.val() === this.options.selectAllValue;
                if (this.options.selectedClass) {
                    if (checked) {
                        $target.closest(".multiselect-option").addClass(this.options.selectedClass)
                    } else {
                        $target.closest(".multiselect-option").removeClass(this.options.selectedClass)
                    }
                }
                var value = $target.val();
                var $option = this.getOptionByValue(value);
                var $optionsNotThis = $("option", this.$select).not($option);
                var $checkboxesNotThis = $("input", this.$container).not($target);
                if (isSelectAllOption) {
                    if (checked) {
                        this.selectAll(this.options.selectAllJustVisible, true)
                    } else {
                        this.deselectAll(this.options.selectAllJustVisible, true)
                    }
                } else {
                    if (checked) {
                        $option.prop("selected", true);
                        if (this.options.multiple) {
                            $option.prop("selected", true)
                        } else {
                            if (this.options.selectedClass) {
                                $($checkboxesNotThis).closest(".dropdown-item").removeClass(this.options.selectedClass)
                            }
                            $($checkboxesNotThis).prop("checked", false);
                            $optionsNotThis.prop("selected", false);
                            this.$button.click()
                        }
                        if (this.options.selectedClass === "active") {
                            $optionsNotThis.closest(".dropdown-item").css("outline", "")
                        }
                    } else {
                        $option.prop("selected", false)
                    }
                    this.options.onChange($option, checked);
                    this.updateSelectAll();
                    if (this.options.enableClickableOptGroups && this.options.multiple) {
                        this.updateOptGroups()
                    }
                }
                this.$select.change();
                this.updateButtonText();
                if (this.options.preventInputChangeEvent) {
                    return false
                }
            }, this));
            $(".multiselect-option", this.$popupContainer).off("mousedown");
            $(".multiselect-option", this.$popupContainer).on("mousedown", function (e) {
                if (e.shiftKey) {
                    return false
                }
            });
            $(this.$popupContainer).off("touchstart click", ".multiselect-option, .multiselect-all, .multiselect-group");
            $(this.$popupContainer).on("touchstart click", ".multiselect-option, .multiselect-all, .multiselect-group", $.proxy(function (event) {
                event.stopPropagation();
                var $target = $(event.target);
                if (event.shiftKey && this.options.multiple) {
                    if (!$target.is("input")) {
                        event.preventDefault();
                        $target = $target.closest(".multiselect-option").find("input");
                        $target.prop("checked", !$target.prop("checked"))
                    }
                    var checked = $target.prop("checked") || false;
                    if (this.lastToggledInput !== null && this.lastToggledInput !== $target) {
                        var from = this.$popupContainer.find(".multiselect-option:visible").index($target.closest(".multiselect-option"));
                        var to = this.$popupContainer.find(".multiselect-option:visible").index(this.lastToggledInput.closest(".multiselect-option"));
                        if (from > to) {
                            var tmp = to;
                            to = from;
                            from = tmp
                        }
                        ++to;
                        var range = this.$popupContainer.find(".multiselect-option:not(.multiselect-filter-hidden)").slice(from, to).find("input");
                        range.prop("checked", checked);
                        if (this.options.selectedClass) {
                            range.closest(".multiselect-option").toggleClass(this.options.selectedClass, checked)
                        }
                        for (var i = 0, j = range.length; i < j; i++) {
                            var $checkbox = $(range[i]);
                            var $option = this.getOptionByValue($checkbox.val());
                            $option.prop("selected", checked)
                        }
                    }
                    $target.trigger("change")
                } else if (!$target.is("input")) {
                    var $checkbox = $target.closest(".multiselect-option, .multiselect-all").find(".form-check-input");
                    if ($checkbox.length > 0) {
                        if (this.options.multiple || !$checkbox.prop("checked")) {
                            $checkbox.prop("checked", !$checkbox.prop("checked"));
                            $checkbox.change()
                        }
                    } else if (this.options.enableClickableOptGroups && this.options.multiple && !$target.hasClass("caret-container")) {
                        var groupItem = $target;
                        if (!groupItem.hasClass("multiselect-group")) {
                            groupItem = $target.closest(".multiselect-group")
                        }
                        $checkbox = groupItem.find(".form-check-input");
                        if ($checkbox.length > 0) {
                            $checkbox.prop("checked", !$checkbox.prop("checked"));
                            $checkbox.change()
                        }
                    }
                    event.preventDefault()
                }
                var $input = $target.closest(".multiselect-option").find("input[type='checkbox'], input[type='radio']");
                if ($input.length > 0) {
                    this.lastToggledInput = $target
                } else {
                    this.lastToggledInput = null
                }
                $target.blur()
            }, this));
            this.$container.off("keydown.multiselect").on("keydown.multiselect", $.proxy(function (event) {
                if ($("input.multiselect-search", this.$container).is(":focus")) {
                    return
                }
                if (event.keyCode === 9 && this.$container.hasClass("show")) {
                    this.$button.click()
                } else {
                    var $items = $(this.$container).find(".multiselect-option:not(.disabled), .multiselect-group:not(.disabled), .multiselect-all").filter(":visible");
                    if (!$items.length) {
                        return
                    }
                    var index = $items.index($items.filter(":focus"));
                    var $current = $items.eq(index);
                    if (event.keyCode === 32) {
                        var $checkbox = $current.find("input");
                        $checkbox.prop("checked", !$checkbox.prop("checked"));
                        $checkbox.change();
                        event.preventDefault()
                    }
                    if (event.keyCode === 13) {
                        setTimeout(function () {
                            $current.focus()
                        }, 0)
                    }
                }
            }, this));
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                $(".multiselect-group input", this.$popupContainer).off("change");
                $(".multiselect-group input", this.$popupContainer).on("change", $.proxy(function (event) {
                    event.stopPropagation();
                    var $target = $(event.target);
                    var checked = $target.prop("checked") || false;
                    var $item = $(event.target).closest(".dropdown-item");
                    var $group = $item.nextUntil(".multiselect-group").not(".multiselect-filter-hidden").not(".disabled");
                    var $inputs = $group.find("input");
                    var $options = [];
                    if (this.options.selectedClass) {
                        if (checked) {
                            $item.addClass(this.options.selectedClass)
                        } else {
                            $item.removeClass(this.options.selectedClass)
                        }
                    }
                    $.each($inputs, $.proxy(function (index, input) {
                        var $input = $(input);
                        var value = $input.val();
                        var $option = this.getOptionByValue(value);
                        if (checked) {
                            $input.prop("checked", true);
                            $input.closest(".dropdown-item").addClass(this.options.selectedClass);
                            $option.prop("selected", true)
                        } else {
                            $input.prop("checked", false);
                            $input.closest(".dropdown-item").removeClass(this.options.selectedClass);
                            $option.prop("selected", false)
                        }
                        $options.push(this.getOptionByValue(value))
                    }, this));
                    this.options.onChange($options, checked);
                    this.$select.change();
                    this.updateButtonText();
                    this.updateSelectAll()
                }, this))
            }
            if (this.options.enableCollapsibleOptGroups && this.options.multiple) {
                $(".multiselect-group .caret-container", this.$popupContainer).off("click");
                $(".multiselect-group .caret-container", this.$popupContainer).on("click", $.proxy(function (event) {
                    var $group = $(event.target).closest(".multiselect-group");
                    var $inputs = $group.nextUntil(".multiselect-group").not(".multiselect-filter-hidden");
                    var visible = true;
                    $inputs.each(function () {
                        visible = visible && !$(this).hasClass("multiselect-collapsible-hidden")
                    });
                    if (visible) {
                        $inputs.hide().addClass("multiselect-collapsible-hidden")
                    } else {
                        $inputs.show().removeClass("multiselect-collapsible-hidden")
                    }
                }, this))
            }
        }, createCheckbox: function ($item, label, name, value, title, inputType) {
            var $wrapper = $("<span />");
            $wrapper.addClass("form-check");
            if (this.options.enableHTML && $(label).length > 0) {
                var $checkboxLabel = $('<label class="form-check-label" />');
                $checkboxLabel.html(label);
                $wrapper.append($checkboxLabel)
            } else {
                var $checkboxLabel = $('<label class="form-check-label" />');
                $checkboxLabel.text(label);
                $wrapper.append($checkboxLabel)
            }
            var $checkbox = $('<input class="form-check-input"/>').attr("type", inputType);
            $checkbox.val(value);
            $wrapper.prepend($checkbox);
            if (name) {
                $checkbox.attr("name", name)
            }
            $item.prepend($wrapper);
            $item.attr("title", title || label);
            return $checkbox
        }, createOptionValue: function (element, isGroupOption) {
            var $element = $(element);
            if ($element.is(":selected")) {
                $element.prop("selected", true)
            }
            var label = this.options.optionLabel(element);
            var classes = this.options.optionClass(element);
            var value = $element.val();
            var inputType = this.options.multiple ? "checkbox" : "radio";
            var title = $element.attr("title");
            var $option = $(this.options.templates.option);
            $option.addClass(classes);
            if (isGroupOption && this.options.indentGroupOptions) {
                $option.addClass("multiselect-group-option-indented")
            }
            if (this.options.collapseOptGroupsByDefault && $(element).parent().prop("tagName").toLowerCase() === "optgroup") {
                $option.addClass("multiselect-collapsible-hidden");
                $option.hide()
            }
            var name = this.options.checkboxName($element);
            var $checkbox = this.createCheckbox($option, label, name, value, title, inputType);
            var selected = $element.prop("selected") || false;
            if (value === this.options.selectAllValue) {
                $option.addClass("multiselect-all");
                $option.removeClass("multiselect-option");
                $checkbox.parent().parent().addClass("multiselect-all")
            }
            this.$popupContainer.append($option);
            if ($element.is(":disabled")) {
                $checkbox.attr("disabled", "disabled").prop("disabled", true).closest(".dropdown-item").addClass("disabled")
            }
            $checkbox.prop("checked", selected);
            if (selected && this.options.selectedClass) {
                $checkbox.closest(".dropdown-item").addClass(this.options.selectedClass)
            }
        }, createDivider: function (element) {
            var $divider = $(this.options.templates.divider);
            this.$popupContainer.append($divider)
        }, createOptgroup: function (group) {
            var $group = $(group);
            var label = $group.attr("label");
            var value = $group.attr("value");
            var title = $group.attr("title");
            var $groupOption = $("<span class='multiselect-group dropdown-item-text'></span>");
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                $groupOption = $(this.options.templates.optionGroup);
                var $checkbox = this.createCheckbox($groupOption, label, null, value, title, "checkbox")
            } else {
                if (this.options.enableHTML) {
                    $groupOption.html(" " + label)
                } else {
                    $groupOption.text(" " + label)
                }
            }
            var classes = this.options.optionClass(group);
            $groupOption.addClass(classes);
            if (this.options.enableCollapsibleOptGroups && this.options.multiple) {
                $groupOption.find(".form-check").addClass("d-inline-block");
                $groupOption.append('<span class="caret-container dropdown-toggle pl-1"></span>')
            }
            if ($group.is(":disabled")) {
                $groupOption.addClass("disabled")
            }
            this.$popupContainer.append($groupOption);
            $("option", group).each($.proxy(function ($, group) {
                this.createOptionValue(group, true)
            }, this))
        }, buildReset: function () {
            if (this.options.includeResetOption) {
                if (this.options.includeResetDivider) {
                    var divider = $(this.options.templates.divider);
                    divider.addClass("mt-0");
                    this.$popupContainer.prepend(divider)
                }
                var $resetButton = $(this.options.templates.resetButton);
                if (this.options.enableHTML) {
                    $("button", $resetButton).html(this.options.resetText)
                } else {
                    $("button", $resetButton).text(this.options.resetText)
                }
                $("button", $resetButton).click($.proxy(function () {
                    this.clearSelection()
                }, this));
                this.$popupContainer.prepend($resetButton)
            }
        }, buildSelectAll: function () {
            if (typeof this.options.selectAllValue === "number") {
                this.options.selectAllValue = this.options.selectAllValue.toString()
            }
            var alreadyHasSelectAll = this.hasSelectAll();
            if (!alreadyHasSelectAll && this.options.includeSelectAllOption && this.options.multiple && $("option", this.$select).length > this.options.includeSelectAllIfMoreThan) {
                if (this.options.includeSelectAllDivider) {
                    this.$popupContainer.prepend($(this.options.templates.divider))
                }
                var $option = $(this.options.templates.li || this.options.templates.option);
                var $checkbox = this.createCheckbox($option, this.options.selectAllText, this.options.selectAllName, this.options.selectAllValue, this.options.selectAllText, "checkbox");
                $option.addClass("multiselect-all");
                $option.removeClass("multiselect-option");
                $option.find(".form-check-label").addClass("font-weight-bold");
                this.$popupContainer.prepend($option);
                $checkbox.prop("checked", false)
            }
        }, buildFilter: function () {
            if (this.options.enableFiltering || this.options.enableCaseInsensitiveFiltering) {
                var enableFilterLength = Math.max(this.options.enableFiltering, this.options.enableCaseInsensitiveFiltering);
                if (this.$select.find("option").length >= enableFilterLength) {
                    this.$filter = $(this.options.templates.filter);
                    $("input", this.$filter).attr("placeholder", this.options.filterPlaceholder);
                    if (!this.options.includeFilterClearBtn) {
                        this.$filter.find(".multiselect-search").attr("type", "text");
                        this.$filter.find(".multiselect-clear-filter").remove()
                    } else {
                        if (this.isFirefox() && this.$filter.find(".multiselect-clear-filter").length === 0) {
                            this.$filter.append("<i class='fas fa-times text-muted multiselect-clear-filter multiselect-moz-clear-filter'></i>")
                        }
                        this.$filter.find(".multiselect-clear-filter").on("click", $.proxy(function (event) {
                            clearTimeout(this.searchTimeout);
                            this.query = "";
                            this.$filter.find(".multiselect-search").val("");
                            $(".dropdown-item", this.$popupContainer).show().removeClass("multiselect-filter-hidden");
                            this.updateSelectAll();
                            if (this.options.enableClickableOptGroups && this.options.multiple) {
                                this.updateOptGroups()
                            }
                        }, this))
                    }
                    this.$popupContainer.prepend(this.$filter);
                    this.$filter.val(this.query).on("click", function (event) {
                        event.stopPropagation()
                    }).on("input keydown", $.proxy(function (event) {
                        if (event.which === 13) {
                            event.preventDefault()
                        }
                        if (this.isFirefox() && this.options.includeFilterClearBtn) {
                            if (event.target.value) {
                                this.$filter.find(".multiselect-moz-clear-filter").show()
                            } else {
                                this.$filter.find(".multiselect-moz-clear-filter").hide()
                            }
                        }
                        clearTimeout(this.searchTimeout);
                        this.searchTimeout = this.asyncFunction($.proxy(function () {
                            if (this.query !== event.target.value) {
                                this.query = event.target.value;
                                var currentGroup, currentGroupVisible;
                                $.each($(".multiselect-option, .multiselect-group", this.$popupContainer), $.proxy(function (index, element) {
                                    var value = $("input", element).length > 0 ? $("input", element).val() : "";
                                    var text = $(".form-check-label", element).text();
                                    var filterCandidate = "";
                                    if (this.options.filterBehavior === "text") {
                                        filterCandidate = text
                                    } else if (this.options.filterBehavior === "value") {
                                        filterCandidate = value
                                    } else if (this.options.filterBehavior === "both") {
                                        filterCandidate = text + "\n" + value
                                    }
                                    if (value !== this.options.selectAllValue && text) {
                                        var showElement = false;
                                        if (this.options.enableCaseInsensitiveFiltering) {
                                            filterCandidate = filterCandidate.toLowerCase();
                                            this.query = this.query.toLowerCase()
                                        }
                                        if (this.options.enableFullValueFiltering && this.options.filterBehavior !== "both") {
                                            var valueToMatch = filterCandidate.trim().substring(0, this.query.length);
                                            if (this.query.indexOf(valueToMatch) > -1) {
                                                showElement = true
                                            }
                                        } else if (filterCandidate.indexOf(this.query) > -1) {
                                            showElement = true
                                        }
                                        if (!showElement) {
                                            $(element).css("display", "none");
                                            $(element).addClass("multiselect-filter-hidden")
                                        }
                                        if (showElement) {
                                            $(element).css("display", "block");
                                            $(element).removeClass("multiselect-filter-hidden")
                                        }
                                        if ($(element).hasClass("multiselect-group")) {
                                            currentGroup = element;
                                            currentGroupVisible = showElement
                                        } else {
                                            if (showElement) {
                                                $(currentGroup).show().removeClass("multiselect-filter-hidden")
                                            }
                                            if (!showElement && currentGroupVisible) {
                                                $(element).show().removeClass("multiselect-filter-hidden")
                                            }
                                        }
                                    }
                                }, this))
                            }
                            this.updateSelectAll();
                            if (this.options.enableClickableOptGroups && this.options.multiple) {
                                this.updateOptGroups()
                            }
                            this.options.onFiltering(event.target)
                        }, this), 300, this)
                    }, this))
                }
            }
        }, destroy: function () {
            this.$container.remove();
            this.$select.show();
            this.$select.prop("disabled", this.options.wasDisabled);
            this.$select.data("multiselect", null)
        }, refresh: function () {
            var inputs = {};
            $(".multiselect-option input", this.$popupContainer).each(function () {
                inputs[$(this).val()] = $(this)
            });
            $("option", this.$select).each($.proxy(function (index, element) {
                var $elem = $(element);
                var $input = inputs[$(element).val()];
                if ($elem.is(":selected")) {
                    $input.prop("checked", true);
                    if (this.options.selectedClass) {
                        $input.closest(".multiselect-option").addClass(this.options.selectedClass)
                    }
                } else {
                    $input.prop("checked", false);
                    if (this.options.selectedClass) {
                        $input.closest(".multiselect-option").removeClass(this.options.selectedClass)
                    }
                }
                if ($elem.is(":disabled")) {
                    $input.attr("disabled", "disabled").prop("disabled", true).closest(".multiselect-option").addClass("disabled")
                } else {
                    $input.prop("disabled", false).closest(".multiselect-option").removeClass("disabled")
                }
            }, this));
            this.updateButtonText();
            this.updateSelectAll();
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
        }, select: function (selectValues, triggerOnChange) {
            if (!$.isArray(selectValues)) {
                selectValues = [selectValues]
            }
            for (var i = 0; i < selectValues.length; i++) {
                var value = selectValues[i];
                if (value === null || value === undefined) {
                    continue
                }
                var $option = this.getOptionByValue(value);
                var $checkbox = this.getInputByValue(value);
                if ($option === undefined || $checkbox === undefined) {
                    continue
                }
                if (!this.options.multiple) {
                    this.deselectAll(false)
                }
                if (this.options.selectedClass) {
                    $checkbox.closest(".dropdown-item").addClass(this.options.selectedClass)
                }
                $checkbox.prop("checked", true);
                $option.prop("selected", true);
                if (triggerOnChange) {
                    this.options.onChange($option, true)
                }
            }
            this.updateButtonText();
            this.updateSelectAll();
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
        }, clearSelection: function () {
            this.deselectAll(false);
            this.updateButtonText();
            this.updateSelectAll();
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
        }, deselect: function (deselectValues, triggerOnChange) {
            if (!$.isArray(deselectValues)) {
                deselectValues = [deselectValues]
            }
            for (var i = 0; i < deselectValues.length; i++) {
                var value = deselectValues[i];
                if (value === null || value === undefined) {
                    continue
                }
                var $option = this.getOptionByValue(value);
                var $checkbox = this.getInputByValue(value);
                if ($option === undefined || $checkbox === undefined) {
                    continue
                }
                if (this.options.selectedClass) {
                    $checkbox.closest(".dropdown-item").removeClass(this.options.selectedClass)
                }
                $checkbox.prop("checked", false);
                $option.prop("selected", false);
                if (triggerOnChange) {
                    this.options.onChange($option, false)
                }
            }
            this.updateButtonText();
            this.updateSelectAll();
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
        }, selectAll: function (justVisible, triggerOnSelectAll) {
            var justVisible = typeof justVisible === "undefined" ? true : justVisible;
            if (justVisible) {
                var visibleOptions = $(".multiselect-option:not(.disabled):not(.multiselect-filter-hidden)", this.$popupContainer);
                $("input:enabled", visibleOptions).prop("checked", true);
                visibleOptions.addClass(this.options.selectedClass);
                $("input:enabled", visibleOptions).each($.proxy(function (index, element) {
                    var value = $(element).val();
                    var option = this.getOptionByValue(value);
                    $(option).prop("selected", true)
                }, this))
            } else {
                var allOptions = $(".multiselect-option:not(.disabled)", this.$popupContainer);
                $("input:enabled", allOptions).prop("checked", true);
                allOptions.addClass(this.options.selectedClass);
                $("input:enabled", allOptions).each($.proxy(function (index, element) {
                    var value = $(element).val();
                    var option = this.getOptionByValue(value);
                    $(option).prop("selected", true)
                }, this))
            }
            $('.multiselect-option input[value="' + this.options.selectAllValue + '"]', this.$popupContainer).prop("checked", true);
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
            this.updateButtonText();
            this.updateSelectAll();
            if (triggerOnSelectAll) {
                this.options.onSelectAll()
            }
        }, deselectAll: function (justVisible, triggerOnDeselectAll) {
            var justVisible = typeof justVisible === "undefined" ? true : justVisible;
            if (justVisible) {
                var visibleOptions = $(".multiselect-option:not(.disabled):not(.multiselect-filter-hidden)", this.$popupContainer);
                $('input[type="checkbox"]:enabled', visibleOptions).prop("checked", false);
                visibleOptions.removeClass(this.options.selectedClass);
                $('input[type="checkbox"]:enabled', visibleOptions).each($.proxy(function (index, element) {
                    var value = $(element).val();
                    var option = this.getOptionByValue(value);
                    $(option).prop("selected", false)
                }, this))
            } else {
                var allOptions = $(".multiselect-option:not(.disabled):not(.multiselect-group)", this.$popupContainer);
                $('input[type="checkbox"]:enabled', allOptions).prop("checked", false);
                allOptions.removeClass(this.options.selectedClass);
                $('input[type="checkbox"]:enabled', allOptions).each($.proxy(function (index, element) {
                    var value = $(element).val();
                    var option = this.getOptionByValue(value);
                    $(option).prop("selected", false)
                }, this))
            }
            $('.multiselect-all input[value="' + this.options.selectAllValue + '"]', this.$popupContainer).prop("checked", false);
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
            this.updateButtonText();
            this.updateSelectAll();
            if (triggerOnDeselectAll) {
                this.options.onDeselectAll()
            }
        }, rebuild: function () {
            this.$popupContainer.html("");
            this.options.multiple = this.$select.attr("multiple") === "multiple";
            this.buildSelectAll();
            this.buildDropdownOptions();
            this.buildFilter();
            this.updateButtonText();
            this.updateSelectAll(true);
            if (this.options.enableClickableOptGroups && this.options.multiple) {
                this.updateOptGroups()
            }
            if (this.options.disableIfEmpty && $("option", this.$select).length <= 0) {
                this.disable()
            } else {
                this.enable()
            }
            if (this.options.dropRight) {
                this.$container.addClass("dropright")
            } else if (this.options.dropUp) {
                this.$container.addClass("dropup")
            }
            if (this.options.widthSynchronizationMode !== "never") {
                this.synchronizeButtonAndPopupWidth()
            }
        }, dataprovider: function (dataprovider) {
            var groupCounter = 0;
            var $select = this.$select.empty();
            $.each(dataprovider, function (index, option) {
                var $tag;
                if ($.isArray(option.children)) {
                    groupCounter++;
                    $tag = $("<optgroup/>").attr({
                        label: option.label || "Group " + groupCounter,
                        disabled: !!option.disabled,
                        value: option.value
                    });
                    forEach(option.children, function (subOption) {
                        var attributes = {
                            value: subOption.value,
                            label: subOption.label || subOption.value,
                            title: subOption.title,
                            selected: !!subOption.selected,
                            disabled: !!subOption.disabled
                        };
                        for (var key in subOption.attributes) {
                            attributes["data-" + key] = subOption.attributes[key]
                        }
                        $tag.append($("<option/>").attr(attributes))
                    })
                } else {
                    var attributes = {
                        value: option.value,
                        label: option.label || option.value,
                        title: option.title,
                        class: option["class"],
                        selected: !!option["selected"],
                        disabled: !!option["disabled"]
                    };
                    for (var key in option.attributes) {
                        attributes["data-" + key] = option.attributes[key]
                    }
                    $tag = $("<option/>").attr(attributes);
                    $tag.text(option.label || option.value)
                }
                $select.append($tag)
            });
            this.rebuild()
        }, enable: function () {
            this.$select.prop("disabled", false);
            this.$button.prop("disabled", false).removeClass("disabled");
            this.updateButtonText()
        }, disable: function () {
            this.$select.prop("disabled", true);
            this.$button.prop("disabled", true).addClass("disabled");
            this.updateButtonText()
        }, setOptions: function (options) {
            this.options = this.mergeOptions(options)
        }, mergeOptions: function (options) {
            return $.extend(true, {}, this.defaults, this.options, options)
        }, hasSelectAll: function () {
            return $(".multiselect-all", this.$popupContainer).length > 0
        }, updateOptGroups: function () {
            var $groups = $(".multiselect-group", this.$popupContainer);
            var selectedClass = this.options.selectedClass;
            $groups.each(function () {
                var $options = $(this).nextUntil(".multiselect-group").not(".multiselect-filter-hidden").not(".disabled");
                var checked = true;
                $options.each(function () {
                    var $input = $("input", this);
                    if (!$input.prop("checked")) {
                        checked = false
                    }
                });
                if (selectedClass) {
                    if (checked) {
                        $(this).addClass(selectedClass)
                    } else {
                        $(this).removeClass(selectedClass)
                    }
                }
                $("input", this).prop("checked", checked)
            })
        }, updateSelectAll: function (notTriggerOnSelectAll) {
            if (this.hasSelectAll()) {
                var allBoxes = $(".multiselect-option:not(.multiselect-filter-hidden):not(.multiselect-group):not(.disabled) input:enabled", this.$popupContainer);
                var allBoxesLength = allBoxes.length;
                var checkedBoxesLength = allBoxes.filter(":checked").length;
                var selectAllItem = $(".multiselect-all", this.$popupContainer);
                var selectAllInput = selectAllItem.find("input");
                if (checkedBoxesLength > 0 && checkedBoxesLength === allBoxesLength) {
                    selectAllInput.prop("checked", true);
                    selectAllItem.addClass(this.options.selectedClass)
                } else {
                    selectAllInput.prop("checked", false);
                    selectAllItem.removeClass(this.options.selectedClass)
                }
            }
        }, updateButtonText: function () {
            var options = this.getSelected();
            if (this.options.enableHTML) {
                $(".multiselect .multiselect-selected-text", this.$container).html(this.options.buttonText(options, this.$select))
            } else {
                $(".multiselect .multiselect-selected-text", this.$container).text(this.options.buttonText(options, this.$select))
            }
            $(".multiselect", this.$container).attr("title", this.options.buttonTitle(options, this.$select));
            this.$button.trigger("change")
        }, getSelected: function () {
            return $("option", this.$select).filter(":selected")
        }, getOptionByValue: function (value) {
            var options = $("option", this.$select);
            var valueToCompare = value.toString();
            for (var i = 0; i < options.length; i = i + 1) {
                var option = options[i];
                if (option.value === valueToCompare) {
                    return $(option)
                }
            }
        }, getInputByValue: function (value) {
            var checkboxes = $(".multiselect-option input:not(.multiselect-search)", this.$popupContainer);
            var valueToCompare = value.toString();
            for (var i = 0; i < checkboxes.length; i = i + 1) {
                var checkbox = checkboxes[i];
                if (checkbox.value === valueToCompare) {
                    return $(checkbox)
                }
            }
        }, updateOriginalOptions: function () {
            this.originalOptions = this.$select.clone()[0].options
        }, asyncFunction: function (callback, timeout, self) {
            var args = Array.prototype.slice.call(arguments, 3);
            return setTimeout(function () {
                callback.apply(self || window, args)
            }, timeout)
        }, setAllSelectedText: function (allSelectedText) {
            this.options.allSelectedText = allSelectedText;
            this.updateButtonText()
        }, isFirefox: function () {
            var firefoxIdentifier = "firefox";
            var valueNotFoundIndex = -1;
            if (navigator && navigator.userAgent) {
                return navigator.userAgent.toLocaleLowerCase().indexOf(firefoxIdentifier) > valueNotFoundIndex
            }
            return false
        }
    };
    $.fn.multiselect = function (option, parameter, extraOptions) {
        return this.each(function () {
            var data = $(this).data("multiselect");
            var options = typeof option === "object" && option;
            if (!data) {
                data = new Multiselect(this, options);
                $(this).data("multiselect", data)
            }
            if (typeof option === "string") {
                data[option](parameter, extraOptions);
                if (option === "destroy") {
                    $(this).data("multiselect", false)
                }
            }
        })
    };
    $.fn.multiselect.Constructor = Multiselect;
    $(function () {
        $("select[data-role=multiselect]").multiselect()
    })
});