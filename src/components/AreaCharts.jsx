import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import momentJalali from "moment-jalaali";
import fa from "moment/locale/fa";
import en from "moment/locale/en-au";
import { getCurrentDate } from "./utils/Data";
import { chartDateTimeFormat, chartDateFormat } from "./constant/Index";
import "./AreaCharts.css";

const AreaChart = ({
  data = [],
  timeRange = "currMonth",
  className = null,
  id = "area-chart",
  seriesTooltipTitle,
  persianMode = true,
  theme,
  seriesStrokeWidth = 1,
  valueAxisTitle = null,
  seriesTooltipHtml = null,
  exportable = true,
  exportMenuItems = null,
  dateAxisMinGridDistance = 60,
  dateAxisStartLocation = 0,
  dateaxisEndLocation = 0,
  dateAxisStart = 0.8,
  dateAxisKeepSelection = false,
  seriesTooltipIsDisabled = false,
  seriesIsStack = true,
  seriesHasBullet = true,
  hasXyCursor = true,
  hasScrollbarX = true,
  dateFormatterIsUtc = false,
  dateAxisTooltipIsDisabled = true,
  exportFilePrefix = null,
  jalaliDateKeyName = "jalaliDate",
  dateKeyName = "date",
  valueKeyName = "value",
  valueAxisMaxPrecision = 0,
}) => {
  const [defaultTheme, setDefaultTheme] = useState(
      theme
        ? theme
        : {
            name: "green",
            gridColor: "#ccc",
            gridWidth: 2,
            gridOpacity: 0.5,
            labelsColor: "#000",
            seriesOpacity: 0.1,
            fadeOpacity: 1,
            seriesTooltipBackgroundColor: "#fff",
            seriesTooltipBackgroundOpacity: 0.8,
            seriesFillOpacity: 0.7,
            colors: [
              am4core.color("#00d084"),
              am4core.color("#474776"),
              am4core.color("#65d5c3"),
              am4core.color("#c7b1a0"),
              am4core.color("#ab8a88"),
              am4core.color("#fbc7ac"),
              am4core.color("#f59891"),
              am4core.color("#cf899e"),
              am4core.color("#7e98b5"),
              am4core.color("#9c9bb1"),
            ],
          }
    ),
    getTimeSettings = () => {
      let timeUnit = timeRange,
        count = 1,
        inputDateFormat = chartDateFormat,
        timeRangeValue = {};
      momentJalali.locale("en", en);
      if (persianMode) {
        momentJalali.locale("fa", fa);
        momentJalali.loadPersian({ dialect: "persian-modern" });
      }
      switch (timeRange) {
        case "currYear":
          timeUnit = "day";
          timeRangeValue = {
            min: momentJalali()
              .startOf(persianMode ? "jYear" : "year")
              .valueOf(),
            max: momentJalali()
              .endOf(persianMode ? "jYear" : "year")
              .valueOf(),
            format: `YYYY MM`,
            jalaliFormat: `jMMMM`,
          };
          break;
        case "currWeek":
          timeUnit = "minute";
          timeRangeValue = {
            min: momentJalali().startOf("week").valueOf(),
            max: momentJalali().endOf("week").valueOf(),
            format: `MMM DD`,
            jalaliFormat: `jMMMM jDD`,
          };
          break;
        case "currDay":
          timeUnit = "minute";
          timeRangeValue = {
            min: momentJalali().startOf("day").valueOf(),
            max: momentJalali().endOf("day").valueOf(),
            format: `HH:mm`,
            jalaliFormat: `HH:mm`,
          };
          inputDateFormat = chartDateTimeFormat;
          break;
        default:
          timeUnit = "hour";
          timeRangeValue = {
            min: momentJalali()
              .startOf(persianMode ? "jMonth" : "month")
              .valueOf(),
            max: momentJalali()
              .endOf(persianMode ? "jMonth" : "month")
              .valueOf(),
            format: `MMM DD`,
            jalaliFormat: "jMMMM jDD",
          };
          break;
      }
      return {
        timeUnit: timeUnit,
        timeRangeValue: timeRangeValue,
        inputDateFormat: inputDateFormat,
        count: count,
      };
    };

  const initalChart = () => {
    const {
      inputDateFormat,
      count,
      timeRangeValue,
      timeUnit,
    } = getTimeSettings();
    am4core.useTheme(am4themes_animated);
    am4core.useTheme(am4themes_material);
    const chart = am4core.create(id, am4charts.XYChart);
    chart.paddingRight = 20;
    chart.dateFormatter.inputDateFormat = inputDateFormat;
    chart.rtl = persianMode;
    chart.background.opacity = 0.5;
    chart.data = data;
    chart.preloader.disabled = false;
    chart.colors.list = defaultTheme.colors;

    // export options
    if (exportable) {
      chart.exporting.menu = new am4core.ExportMenu();
      chart.exporting.filePrefix = exportFilePrefix
        ? exportFilePrefix
        : getCurrentDate(persianMode ? "persian" : "gregorian");
      chart.exporting.menu.items = exportMenuItems
        ? exportMenuItems
        : [
            {
              label: `<p>&#9776;</p>`,
              menu: [
                {
                  label: persianMode ? "تصویر" : "Image",
                  menu: [
                    { type: "png", label: "PNG" },
                    { type: "jpg", label: "JPG" },
                    { type: "svg", label: "SVG" },
                    { type: "pdf", label: "PDF" },
                  ],
                },
                {
                  label: persianMode ? "داده" : "Data",
                  menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "pdfdata", label: "PDF" },
                  ],
                },
              ],
            },
          ];
    }
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = dateAxisMinGridDistance;
    dateAxis.startLocation = dateAxisStartLocation;
    dateAxis.endLocation = dateaxisEndLocation;
    dateAxis.start = dateAxisStart;
    dateAxis.keepSelection = dateAxisKeepSelection;
    dateAxis.tooltip.disabled = dateAxisTooltipIsDisabled;
    dateAxis.baseInterval = {
      timeUnit: timeUnit,
      count: count,
    };
    dateAxis.renderer.labels.template.fill = defaultTheme.labelsColor;
    chart.dateFormatter.utc = dateFormatterIsUtc;
    // change date aixis date
    dateAxis.renderer.labels.template.adapter.add("text", (value, target) => {
      const dateObject = target.dataItem.dates.date;
      let jalaliDate = null;
      if (dateObject)
        jalaliDate = momentJalali(dateObject).format(
          persianMode ? timeRangeValue.jalaliFormat : timeRangeValue.format
        );
      return jalaliDate;
    });
    // change date axis tooltip text
    dateAxis.adapter.add("getTooltipText", (value, target) => {
      const dateObject = target.tooltipDate;
      let jalaliDate = null;
      if (dateObject)
        jalaliDate = momentJalali(dateObject).format(
          persianMode ? timeRangeValue.jalaliFormat : timeRangeValue.format
        );
      return jalaliDate;
    });
    if (timeRangeValue.format.length)
      dateAxis.dateFormats.setKey(timeUnit, timeRangeValue.format);
    dateAxis.min = timeRangeValue.min;
    dateAxis.max = timeRangeValue.max;
    dateAxis.renderer.grid.template.stroke = am4core.color(
      defaultTheme.gridColor
    );
    dateAxis.renderer.grid.template.strokeOpacity = defaultTheme.gridOpacity;
    // style category axis labels
    dateAxis.renderer.labels.template.fill = am4core.color(
      defaultTheme.labelsColor
    );

    dateAxis.tooltipDateFormat = timeRangeValue.format;
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //style value axis grid
    valueAxis.renderer.grid.template.stroke = am4core.color(
      defaultTheme.gridColor
    );
    valueAxis.renderer.grid.template.strokeOpacity = defaultTheme.gridOpacity;
    valueAxis.renderer.grid.template.strokeWidth = defaultTheme.gridWidth;
    valueAxis.maxPrecision = valueAxisMaxPrecision;
    valueAxis.renderer.grid.template.gridCount = 349742083402;
    valueAxis.renderer.grid.template.location = 0;
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.labels.template.fill = defaultTheme.labelsColor;
    valueAxis.title.text = valueAxisTitle;
    const series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = dateKeyName;
    series.dataFields.valueY = valueKeyName;
    series.tooltip.background.fill = am4core.color(
      defaultTheme.seriesTooltipBackgroundColor
    );
    series.tooltip.background.opacity =
      defaultTheme.seriesTooltipBackgroundOpacity;
    series.tooltip.label.fill = am4core.color(defaultTheme.labelsColor);
    series.strokeWidth = seriesStrokeWidth;
    series.tensionX = 1;
    series.stacked = seriesIsStack;
    seriesHasBullet && series.bullets.push(new am4charts.CircleBullet());
    series.background.fill.fill = defaultTheme.colors[0];
    series.fillOpacity = defaultTheme.seriesOpacity;
    series.tooltip.getFillFromObject = false;
    series.tooltip.disabled = seriesTooltipIsDisabled;

    const defaultSeriesTooltipHtml = `<div style="text-align: center; padding-bottom: 15px;">
    <h5>{${persianMode ? `${jalaliDateKeyName}` : `${dateKeyName}`}}</h5>
    <span>${seriesTooltipTitle}: {${valueKeyName}} </span><br/>
    </div>`;

    series.tooltipHTML = seriesTooltipHtml
      ? seriesTooltipHtml
      : defaultSeriesTooltipHtml;
    series.fillOpacity = defaultTheme.seriesFillOpacity;

    let fillModifier = new am4core.LinearGradientModifier();
    fillModifier.opacities = [0.3, 1];
    fillModifier.offsets = [2, 1];
    fillModifier.gradient.rotation = 90;
    series.segments.template.fillModifier = fillModifier;

    if (hasXyCursor) {
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.lineY.opacity = 1;
    }
    if (hasScrollbarX) {
      chart.scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX.series.push(series);
    }
  };

  useEffect(() => {
    initalChart();
  }, []);

  return <div id={id} className={`chart-root ${className}`}></div>;
};

AreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  timeRange: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  seriesTooltipTitle: PropTypes.string.isRequired,
  persianMode: PropTypes.bool,
  theme: PropTypes.object,
  seriesStrokeWidth: PropTypes.number,
  valueAxisTitle: PropTypes.string,
  seriesTooltipHtml: PropTypes.string,
  exportable: PropTypes.bool,
  exportMenuItems: PropTypes.array,
  dateAxisMinGridDistance: PropTypes.number,
  dateAxisStartLocation: PropTypes.number,
  dateaxisEndLocation: PropTypes.number,
  dateAxisStart: PropTypes.number,
  dateAxisKeepSelection: PropTypes.bool,
  seriesTooltipIsDisabled: PropTypes.bool,
  seriesIsStack: PropTypes.bool,
  seriesHasBullet: PropTypes.bool,
  hasXyCursor: PropTypes.bool,
  hasScrollbarX: PropTypes.bool,
  dateAxisTooltipIsDisabled: PropTypes.bool,
  exportFilePrefix: PropTypes.string,
  jalaliDateKeyName: PropTypes.string,
  dateKeyName: PropTypes.string,
  valueKeyName: PropTypes.string,
  valueAxisMaxPrecision: PropTypes.number,
};

export default AreaChart;
