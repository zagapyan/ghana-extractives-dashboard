import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './CompanyRevenuesComparisonComponent.scss'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import ReactSVG from 'react-svg'
import LoadingBar from 'loading-svg/loading-bars.svg'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap_white.css';
import StackedAreaChart from '../StackedAreaChart/StackedAreaChart';
import { nest } from 'd3-collection';
import { prepVarVsYearChartData } from '../../DataPrepHelpers';
import Select from 'react-select';
import ScrollableAnchor from 'react-scrollable-anchor';
const Range = createSliderWithTooltip(Slider.Range);

const formatter = (format) => {
  switch (format) {
    default:
      return value => value
  }
}

class CompanyRevenuesComparisonComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      range: this.props.range,
      cName: this.props.cName
    }
  }

  handleClearFilters() {
    const { cName, range } = this.defaultProps;

    this.setState({
      cName: cName,
      range: range
    })
  }
  handleFilter(cName, range) {

    const cNameArray = Array.isArray(cName) ? cName : [cName];

    console.log(cNameArray);
    const
      min = range[0] || 2004,
      max = range[1] || 2014;
    return this.props.companyPayments
      .filter(c => c.year >= min) // cut off minimum
      .filter(c => c.year <= max) // cutt off maximum
      .filter(c => cNameArray.length ? cNameArray.includes(c.company_name) : true) // if cName is selected, filter it else return the array as is
  }

  handleChange = () => {
    const { cName, range } = this.state;
    this.handleFilter(cName, range);
  }

  handleClear = () => {
    this.handleClearFilters()
    this.refs.c_select.value = this.props.cName;
  }

  handleLog = (msg) => console.log(msg);

  static defaultProps = {
    range: [2004, 2014],
    cName: []
  }
  static propTypes = {
    uniqueCompanies: PropTypes.arrayOf(PropTypes.string),
    uniqueYears: PropTypes.arrayOf(PropTypes.number),
    nestedColorScale: PropTypes.func,
    cName: PropTypes.arrayOf(PropTypes.string)
  }
  render() {
    const { uniqueCommodities, uniqueYears, uniqueCompanies,
      uniquePaymentStreams, reusableNestedColorScale } = this.props;
    const isLoading = !!(this.props.companyPayments.length) ? false : true;

    console.log("rendering isLoading: " + !!isLoading);
    return (
      <ScrollableAnchor id="company-revenue-comparisons">
        <div className="CompanyRevenuesComparisonComponent">
          <div className="column">
            <h2 className="title is-3">Company Revenue Comparisons</h2>
            <div className="field has-addons">
              {!!isLoading
                ? <ReactSVG src={LoadingBar} className="svg-container " svgClassName="loading-bars" />
                :
                <div className="column control">
                  <label className="label">Use slider to select years to display</label>
                  <br /><br />
                  <Range allowCross={false}
                    defaultValue={[this.props.range[0], this.props.range[1]]}
                    min={this.props.range[0]}
                    max={this.props.range[1]}
                    tipFormatter={formatter()}
                    onAfterChange={(range) => this.setState({ range })}
                    tipProps={{ placement: 'top', prefixCls: 'rc-tooltip', mouseLeaveDelay: 2, visible: true }}
                    dots={true}
                    pushable={true}
                  />
                  <br />
                  <label className="label">Use dropdown box to to select companies to display</label>
                  <p>(When you select companies, each company's revenues will be shown in individual
                charts below the main chart)</p>
                  <div className="select">

                    <Select
                      onChange={(options) => {
                        this.handleLog(options);
                        const val = options.map(o => o.value);
                        this.setState({ cName: [...options.map(o => o.value)] });
                      }}
                      options={uniqueCompanies.map((c) => ({ value: c, label: c }))}
                      closeMenuOnSelect={false}
                      isMulti={true}
                      autosize={false}
                      placeholder={'All values shown when box is cleared...'}
                    // defaultValue={uniqueCommodities.map((commodity) => ({value: commodity, label: commodity}))}
                    />


                  </div>
                  {/* <button className="button" onClick={() => this.handleClear()}>Clear</button> */}
                  <br /><br /><br />
                  <div className='chart'>
                    <StackedAreaChart
                      // data={this.prepChartData()} 
                      data={prepVarVsYearChartData(
                        'company_name',
                        'value_reported',
                        this.handleFilter(this.state.cName, this.state.range)
                      )}
                      uniqueCommodities={uniqueCommodities}
                      uniquePaymentStreams={uniquePaymentStreams}
                      uniqueYears={uniqueYears}
                      nestedColorScale={reusableNestedColorScale(uniqueCompanies)}
                      size={[500, 500]} />


                    <div className="small-multiples-list">
                      {this.state.cName.map((item, index) => (
                        <div className="small-multiples-item">
                          <p>{item}</p>
                          <StackedAreaChart
                            // data={this.prepChartData()} 
                            data={prepVarVsYearChartData(
                              'company_name',
                              'value_reported',
                              this.handleFilter(item, this.state.range)
                            )}
                            uniqueCommodities={uniqueCommodities}
                            uniquePaymentStreams={uniquePaymentStreams}
                            uniqueYears={uniqueYears}
                            nestedColorScale={reusableNestedColorScale(uniqueCompanies)}
                            size={[500, 200]} />
                        </div>
                      ))}
                    </div>

                  </div>
                  {/* {JSON.stringify(companyPayments)} */}
                </div>

              }
            </div>
          </div>
        </div>
      </ScrollableAnchor>
    );
  }
}


export default CompanyRevenuesComparisonComponent
