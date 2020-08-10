// @flow
import { observable } from "mobx";
import { observer, inject } from "mobx-react";
import * as React from "react";
import styled, { withTheme } from "styled-components";
import UiStore from "stores/UiStore";
import { LabelText, Outline } from "components/Input";

type Props = {
  label: string,
  minHeight?: number,
  maxHeight?: number,
  readOnly?: boolean,
  ui: UiStore,
};

@observer
class InputRich extends React.Component<Props> {
  @observable editorComponent: React.ComponentType<any>;
  @observable focused: boolean = false;

  componentDidMount() {
    this.loadEditor();
  }

  handleBlur = () => {
    this.focused = false;
  };

  handleFocus = () => {
    this.focused = true;
  };

  loadEditor = async () => {
    try {
      const EditorImport = await import("./Editor");
      this.editorComponent = EditorImport.default;
    } catch (err) {
      if (err.message && err.message.match(/chunk/)) {
        // If the editor bundle fails to load then reload the entire window. This
        // can happen if a deploy happens between the user loading the initial JS
        // bundle and the async-loaded editor JS bundle as the hash will change.
        window.location.reload();
        return;
      }
      throw err;
    }
  };

  render() {
    const { label, minHeight, maxHeight, ui, ...rest } = this.props;
    const Editor = this.editorComponent;

    return (
      <>
        <LabelText>{label}</LabelText>

        <StyledOutline
          maxHeight={maxHeight}
          minHeight={minHeight}
          focused={this.focused}
        >
          {Editor ? (
            <Editor
              onBlur={this.handleBlur}
              onFocus={this.handleFocus}
              ui={ui}
              grow
              {...rest}
            />
          ) : (
            "Loading…"
          )}
        </StyledOutline>
      </>
    );
  }
}

const StyledOutline = styled(Outline)`
  display: block;
  padding: 8px 12px;
  min-height: ${({ minHeight }) => (minHeight ? `${minHeight}px` : "0")};
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : "auto")};
  overflow-y: auto;

  > * {
    display: block;
  }
`;

export default inject("ui")(withTheme(InputRich));
