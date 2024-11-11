import { assign } from "../helpers/objects";
import { isNullOrUndefined } from "../helpers/typecheckers";
import { IKnownScript, ksGlobal } from "../types/knownscript.types";
import { IDataJs } from "../types/libs/datajs.types";
import { ICS } from "../types/libs/ics.types";
import { IMSAL } from "../types/libs/msal.types";
import { IKLocales } from "../types/locales";
import { typeMomentJS, typeMonentJSTimeZone } from "../types/moment";
import script from "./script";

/** /products/common/scripts/ */
export const commonScriptsPrefix = "/products/common/scripts/";
/** /products/modern/scripts/ */
export const modernScriptsPrefix = "/products/modern/scripts/";

export class KnownScriptLoader<TypeOfGlobal> implements IKnownScript {
    public url: string;
    public dependencies?: IKnownScript[];
    public global: ksGlobal;
    public sodName?: string;
    public css?: string[];
    public rtlCss?: string[];
    public forceMin?: boolean;

    public _hash?: string;

    private _globalInstance?: TypeOfGlobal;
    public get globalInstance() { return this._globalInstance; }

    public constructor(definition: IKnownScript) {
        assign(this, definition);
    }
    public async load(): Promise<TypeOfGlobal> {
        if (isNullOrUndefined(this.globalInstance))
            this._globalInstance = await script.Instance.loadKnownScript(this) as TypeOfGlobal;
        return this.globalInstance;
    }
    public loadSync(): TypeOfGlobal {
        if (isNullOrUndefined(this.globalInstance))
            this._globalInstance = script.Instance.loadKnownScript_Sync(this) as TypeOfGlobal;
        return this.globalInstance;
    }
}

/** loads into $kw */
export var jQueryKnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "jquery-1.8.2.min.js",
    global: "$kw",
    sodName: "kwizcom.common.jquery-1.8.2.js"
});

/** loads into moment */
export var MomentJSKnownScript = new KnownScriptLoader<typeMomentJS>({
    url: "/libs/moment/moment.min.js",
    global: "moment"
});

/** loads into moment.tz */
export var MomentTimezoneJSKnownScript = new KnownScriptLoader<typeMonentJSTimeZone>({
    url: "/libs/moment/moment-timezone.min.js",
    global: "moment.tz",
    dependencies: [MomentJSKnownScript]
});
/** loads into kLocales or kwizcom.kLocales */
export var LocaleKnownScript = new KnownScriptLoader<IKLocales>({
    url: commonScriptsPrefix + "locale.min.js",
    global: "kwizcom.kLocales",
    sodName: "kwizcom.common.locale.js",
    dependencies: [MomentTimezoneJSKnownScript]
});
/** Loads jQuery and Select2 with the CSS file for Select2 */
export var Select2KnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "select2.min.js",
    global: "Select2.class",
    sodName: "kwizcom.common.select2.js",
    css: ["/products/common/css/select2.min.css"],
    dependencies: [jQueryKnownScript]
});
/** Loads fabric and its CSS */
export var FabricKnownScript = new KnownScriptLoader<any>({
    url: "/libs/office-ui-fabric-js/1.4.0/js/fabric.min.js?prefix=kw",
    global: "kwfabric",
    //Issue 6494 rename fabric.css since SP modern page will remove any css that ends with fabric.css or fabric.min.css
    css: ["/libs/office-ui-fabric-js/1.4.0/css/fabric.kwizcom.min.css?prefix=kw",
        "/libs/office-ui-fabric-js/1.4.0/css/fabric.kwizcom.components.min.css?prefix=kw"],
    rtlCss: ["/libs/office-ui-fabric-js/1.4.0/css/fabric.kwizcom.rtl.min.css?prefix=kw",
        "/libs/office-ui-fabric-js/1.4.0/css/fabric.kwizcom.components.rtl.min.css?prefix=kw"]
});
/** loads into kwizcom.aplfe.api */
export var APLFEApiKnownScript = new KnownScriptLoader<any>({
    url: "/products/aplfe/scripts/kwizcom.aplfe.api.min.js",
    global: "kwizcom.aplfe.api",
    sodName: "kwizcom.aplfe.api.js"
});

/** loads into KWizComRepeatingRowsControlBuilder */
export var RRWControlBuilderKnownScript = new KnownScriptLoader<any>({
    url: "/products/aprrw/scripts/controlbuilder.min.js",
    global: "KWizComRepeatingRowsControlBuilder",
    dependencies: [jQueryKnownScript]
});

/** loads into kwOfficeUiFabricReact */
export var OfficeUiFabricReactKnownScript = new KnownScriptLoader<any>({
    url: "/libs/office-ui-fabric-react/office-ui-fabric-react.js",
    global: "kwizcom.OfficeUiFabricReact"
});

/** loads into $kw.ui */
export var jQueryUIKnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "jquery-ui-1.9.2.custom.min.js",
    global: "$kw.ui",
    sodName: "kwizcom.common.jquery-ui-1.9.2.custom.js",
    dependencies: [jQueryKnownScript],
    css: ["/products/common/css/jquery-ui.min.css"]
});
/** loads into $kw.ui.touchLoded */
export var jQueryTouchPunchKnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "jquery.ui.touch-punch.min.js",
    global: "$kw.ui.touchLoded",
    dependencies: [jQueryUIKnownScript]
});
/** loads into $kw.fn.camera */
export var CameraKnownScript = new KnownScriptLoader<any>({
    url: "/libs/camera/js/camera.min.js",
    global: "$kw.fn.camera",
    dependencies: [jQueryUIKnownScript],
    css: ["/libs/camera/css/camera.min.css"]
});
/** loads into flatpickr */
export var FlatPickerKnownScript = new KnownScriptLoader<any>({
    url: "/libs/flatpickr/flatpickr.min.js",
    global: "flatpickr",
    css: ["/libs/flatpickr/flatpickr.min.css"]
});
/** loads into noUiSlider */
export var NoUiSliderKnownScript = new KnownScriptLoader<any>({
    url: "/libs/nouislider/nouislider.min.js",
    global: "noUiSlider",
    css: ["/libs/nouislider/nouislider.min.css"]
});
/** loads into blueimp */
export var BlueImpGalleryKnownScript = new KnownScriptLoader<any>({
    url: "/libs/blueimp-gallery/js/blueimp-gallery.min.js",
    global: "blueimp",
    css: ["/libs/blueimp-gallery/css/blueimp-gallery.min.css"]
});
/** loads into dhx */
export var dhxDiagramKnownScript = new KnownScriptLoader<any>({
    url: "/libs/dhtmlx/diagram.min.js",
    global: "dhx",
    css: ["/libs/dhtmlx/diagram.min.css"]
});
/** loads into dragscroll */
export var dragScrollKnownScript = new KnownScriptLoader<any>({
    url: "/libs/dragscroll/dragscroll.min.js",
    global: "dragscroll"
});
/** loads into getOrgChart */
export var getOrgChartKnownScript = new KnownScriptLoader<any>({
    url: "/libs/getorgchart/getorgchart.min.js",
    global: "getOrgChart",
    css: ["/libs/getorgchart/getorgchart.min.css"]
});
/** loads into OrgChart */
export var OrgChartJsKnownScript = new KnownScriptLoader<any>({
    url: "/libs/orgchartjs/orgchart.min.js",
    global: "OrgChart"
});
/** loads into photopile */
export var PhotopileKnownScript = new KnownScriptLoader<any>({
    url: "/libs/photopile/js/photopile.min.js",
    global: "photopile",
    dependencies: [jQueryTouchPunchKnownScript],
    css: ["/libs/photopile/css/photopile.min.css"]
});

/** loads into $kw.fn.fullCalendar */
export var fullCalendarKnownScript = new KnownScriptLoader<any>({
    url: "/libs/fullcalendar/fullcalendar.min.js",
    global: "$kw.fn.fullCalendar",
    dependencies: [jQueryKnownScript, MomentTimezoneJSKnownScript],
    css: ["/libs/fullcalendar/fullcalendar.min.css"]
});

/** loads into spEventsParser */
export var SpEventsParserKnownScript = new KnownScriptLoader<{
    parseEvent(item: any, startDate: Date, endDate: Date): any[];
}>({
    url: commonScriptsPrefix + "sp-events-parser/sp-events-parser.min.js",
    global: "spEventsParser"
});

/** loads into kwizcom.controls.Conditions */
export var ConditionsKnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "controls/conditions.min.js",
    global: "kwizcom.controls.Conditions",
    dependencies: [LocaleKnownScript]
});
/** loads into KWizComCountdownControlBuilder */
export var CountdownControlBuilderKnownScript = new KnownScriptLoader<any>({
    url: "/products/apcnt/scripts/controlbuilder.min.js",
    global: "KWizComCountdownControlBuilder",
    dependencies: [LocaleKnownScript]
});
/** loads into SP.UI.ModalDialog.showErrorDialog */
export var OnPremPolyfillKnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "onprem.polyfill.min.js",
    sodName: "kwizcom.common.onprem.polyfill.js",
    global: "SP.UI.ModalDialog.showErrorDialog"
});
/** loads into kwizcom.datajs */
export var DataJSKnownScript = new KnownScriptLoader<IDataJs>({
    url: "/libs/datajs/datajs.min.js",
    global: "kwizcom.OData"
});
/** loads into tinymce */
export var TinyMCEKnownScript = new KnownScriptLoader<any>({
    url: "/libs/tinymce/tinymce.min.js",
    forceMin: true,
    global: "tinymce"
});
/** loads into kwizcom.monaco */
export var monacoKnownScript = new KnownScriptLoader<any>({
    url: "/libs/monaco/monaco.js",
    global: "kwizcom.monaco"
});
/** loads into kwizcom.ModernUILibrary.FormPage */
export var ModernUIListFormKnownScript = new KnownScriptLoader<any>({
    url: modernScriptsPrefix + "forms/formpage.min.js",
    global: "kwizcom.ModernUILibrary.FormPage",
    //dependencies: [OfficeUiFabricReact]
});
/** loads into jsonPath */
export var jsonPathKnownScript = new KnownScriptLoader<any>({
    url: commonScriptsPrefix + "JSONPath.min.js",
    global: "jsonPath"
});

/** loads into _global_kwizcom_appas_modern_core */
export var PasteModernCoreKnownScript = new KnownScriptLoader<any>({
    url: "/products/appas/scripts/kwizcom.pasteplus.modern.core.min.js",
    global: "$_global_kwizcom_appas_modern_core",
    //dependencies: [OfficeUiFabricReact]
});
/** loads into kwizcom.libs.msal */
export var msalKnownScript = new KnownScriptLoader<IMSAL>({
    url: commonScriptsPrefix + "msal/msal.min.js",
    global: "kwizcom.libs.msal"
});
/** loads into kwizcom.libs.ics */
export var icsKnownScript = new KnownScriptLoader<ICS>({
    url: "/libs/ics/ics.min.js",
    global: "kwizcom.libs.ics"
});

var _jQueryTmplKnownScript = new KnownScriptLoader<any>({
    url: "/libs/jquery/js/jquery.tmpl.min.js",
    global: "$kw.fn.tmpl", forceMin: true,
    dependencies: [jQueryKnownScript]
});
var _jQueryEasingKnownScript = new KnownScriptLoader<any>({
    url: "/libs/jquery/js/jquery.easing.1.3.js",
    global: "$kw.easing",
    dependencies: [jQueryKnownScript]
});
var _jQueryElastislideKnownScript = new KnownScriptLoader<any>({
    url: "/libs/jquery/js/jquery.elastislide.js",
    global: "$kw.fn.elastislide",
    css: ["/libs/jquery/css/elastislide.css"],
    dependencies: [jQueryKnownScript]
});
/** Responsive Image Gallery */
export var rigKnownScript = new KnownScriptLoader<(containerSelector: string, options?: {
    mode?: "carousel" | "fullview";
    anim?: boolean;
    template?: string;
    /** allow html in image description */
    allowHTML?: boolean;
    hideViewModes?: boolean;

}) => { addItems: (elm) => void; }>({
    url: "/libs/rig/js/gallery.js",
    global: "kwizcom.libs.rig",
    css: ["/libs/rig/css/style.css"],
    dependencies: [jQueryKnownScript, _jQueryTmplKnownScript, _jQueryEasingKnownScript, _jQueryElastislideKnownScript]
});