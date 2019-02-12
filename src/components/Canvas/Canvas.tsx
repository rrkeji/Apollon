import React, { Component, createRef, RefObject } from 'react';
import { connect } from 'react-redux';
import { State as ReduxState } from './../Store';
import Grid from './Grid';
import CanvasContext, { CanvasProvider } from './CanvasContext';
import CoordinateSystem from './CoordinateSystem';
import ConnectLayer from '../Connectable/ConnectLayer';
import LayoutedElement from './../LayoutedElement/LayoutedElement';
import LayoutedRelationship from './../LayoutedRelationship';

import RelationshipMarkers from './../../rendering/renderers/svg/defs/RelationshipMarkers';
import { Droppable, DropEvent } from './../Draggable';
import Diagram, { DiagramRepository } from '../../domain/Diagram';
import { ElementRepository } from '../../domain/Element';
import KeyboardEventListener from './KeyboardEventListener';
import PopupLayer from './../Popup';

class Canvas extends Component<Props, State> {
  state: State = {
    isMounted: false,
  };
  canvas: RefObject<HTMLDivElement> = createRef();
  coordinateSystem = new CoordinateSystem(
    this.canvas,
    this.props.diagram.bounds.width,
    this.props.diagram.bounds.height
  );

  componentDidMount() {
    this.setState({ isMounted: true }, this.center);
  }

  center = () => {
    const container = this.canvas.current!.parentElement!;
    const { width, height } = container.getBoundingClientRect();
    container.scrollTo(
      this.coordinateSystem.width / 2 - width / 2,
      this.coordinateSystem.height / 2 - height / 2
    );
  };

  onDrop = (event: DropEvent) => {
    if (!event.action) return;
    const element = event.action.element;
    const offset = this.coordinateSystem.offset();
    const position = this.coordinateSystem.screenToPoint(
      event.position.x,
      event.position.y
    );
    element.bounds.x = position.x - offset.x;
    element.bounds.y = position.y - offset.y;

    this.props.create(element);
  };

  render() {
    const { diagram } = this.props;
    const context: CanvasContext = {
      canvas: this.canvas.current!,
      coordinateSystem: this.coordinateSystem,
    };

    return (
      <div ref={this.canvas} tabIndex={0}>
        <CanvasProvider value={context}>
          <Droppable onDrop={this.onDrop}>
            <Grid
              grid={10}
              width={diagram.bounds.width}
              height={diagram.bounds.height}
            >
              <PopupLayer>
                {this.state.isMounted && (
                  <>
                    <KeyboardEventListener />
                    <svg width="100%" height="100%">
                      <defs>
                        <RelationshipMarkers />
                      </defs>

                      <ConnectLayer>
                        {diagram.ownedElements.map(element => (
                          <LayoutedElement key={element} element={element} />
                        ))}
                        {diagram.ownedRelationships.map(relationship => (
                          <LayoutedRelationship
                            key={relationship}
                            relationship={relationship}
                            container={this.canvas}
                          />
                        ))}
                      </ConnectLayer>
                    </svg>
                  </>
                )}
              </PopupLayer>
            </Grid>
          </Droppable>
        </CanvasProvider>
      </div>
    );
  }
}

interface OwnProps {}

interface StateProps {
  diagram: Diagram;
}

interface DispatchProps {
  create: typeof ElementRepository.create;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  isMounted: boolean;
}

export default connect<StateProps, DispatchProps, OwnProps, ReduxState>(
  (state: ReduxState): StateProps => ({
    diagram: DiagramRepository.read(state),
  }),
  {
    create: ElementRepository.create,
  }
)(Canvas);