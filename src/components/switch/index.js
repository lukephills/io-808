import React from 'react';
import Radium from 'radium';

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

@Radium
class SoundSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      hoverPosition: props.position,
      xPosition: null,
      yPosition: null
    };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps({ position }) {
    if (position != null) {
      this.setState({ hoverPosition: position });
    }
  }

  handleClick() {
    this.props.onChange(this.state.hoverPosition);
  }

  handleMouseHover({ clientX, clientY }) {
    const { length, padding, direction, numPositions } = this.props;
    const { xPosition, yPosition } = this.state;

    const totalLength = length - (padding * 2);

    let currentRelativeCoord = null;
    switch(direction) {
      case HORIZONTAL:
        currentRelativeCoord = clientX - (xPosition + padding);
        break;
      case VERTICAL:
        currentRelativeCoord = clientY - (yPosition + padding);
        break;
    }

    if (currentRelativeCoord < 0)
      currentRelativeCoord = 0;
    if (currentRelativeCoord > (totalLength - padding))
      currentRelativeCoord = totalLength - padding;

    const hoverPosition = ~~((currentRelativeCoord / totalLength) * numPositions);

    this.setState({ hoverPosition });
  }

  handleMouseEnter({ currentTarget }) {
    const {left: xPosition, top: yPosition} = currentTarget.getBoundingClientRect();

    currentTarget.addEventListener('mousemove', this.handleMouseHover, false);
    currentTarget.addEventListener('click', this.handleClick, false);
    this.setState({ hover: true, xPosition, yPosition });
  }

  handleMouseLeave({ currentTarget }) {
    currentTarget.removeEventListener('mousemove', this.handleMouseHover, false);
    currentTarget.removeEventListener('click', this.handleClick, false);
    this.setState({ hover: false, xPosition: null, yPosition: null, hoverPosition: this.props.position });
  }

  render() {
    const {
      position,
      thickness, length,
      direction,
      numPositions,
      innerThickness,
      padding=0,
      innerStyle={}, outerStyle={}
    }= this.props;

    const positionIncrement = ((length - (padding * 2)) - innerThickness) / (numPositions - 1);
    const positionChange = positionIncrement * position;
    const hoverPositionChange = positionIncrement * this.state.hoverPosition;

    let width, height, innerWidth, innerHeight, transform, hoverTransform = null;
    switch (direction) {
      case VERTICAL:
        width = thickness;
        height = length;

        innerWidth = width - (padding * 2);
        innerHeight = innerThickness;

        transform = `translateY(${positionChange}px)`;
        hoverTransform = `translateY(${hoverPositionChange}px)`;
        break;
      case HORIZONTAL:
        width = length;
        height = thickness;

        innerWidth = innerThickness;
        innerHeight = height - (padding * 2);

        transform = `translateX(${positionChange}px)`;
        hoverTransform = `translateX(${hoverPositionChange}px)`;
        break;
      default:
        throw new Error(`Invalid Direction: ${direction}`);
    }

    const styles = {
      outer: {
        position: 'relative',
        ...outerStyle,
        width, height, padding
      },
      inner: {
        position: 'absolute',
        ...innerStyle,
        width: innerWidth, height: innerHeight,
        transform
      },
      innerHover: {
        position: 'absolute',
        opacity: 0.5,
        ...innerStyle,
        width: innerWidth, height: innerHeight,
        transform: hoverTransform
      }
    };

    if (this.state.hover) {
      styles.outer.cursor = 'pointer';
    }

    return (
      <div onMouseEnter={this.handleMouseEnter}
           onMouseLeave={this.handleMouseLeave}
           ref='outer'
           style={styles.outer}>
        <div style={styles.inner}></div>
        <div style={styles.innerHover}></div>
      </div>
    );
  }
}

SoundSwitch.propTypes = {
  position: React.PropTypes.number.isRequired,
  thickness: React.PropTypes.number.isRequired,
  length: React.PropTypes.number.isRequired,
  direction: React.PropTypes.oneOf([VERTICAL, HORIZONTAL]).isRequired,
  numPositions: React.PropTypes.number.isRequired,
  onChange: React.PropTypes.func.isRequired,
  outerStyle: React.PropTypes.object,
  innerStyle: React.PropTypes.object
};

export default SoundSwitch;