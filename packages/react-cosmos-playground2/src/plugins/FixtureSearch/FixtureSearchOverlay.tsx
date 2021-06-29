import { filter } from 'fuzzaldrin-plus';
import { isEqual } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createFixtureTree,
  FlatFixtureTreeItem,
  flattenFixtureTree,
} from 'react-cosmos-shared2/fixtureTree';
import { FixtureId, FixtureList } from 'react-cosmos-shared2/renderer';
import styled from 'styled-components';
import {
  black60,
  grey128,
  grey160,
  grey176,
  grey208,
  grey224,
  grey248,
  grey64,
} from '../../shared/colors';
import { HelpCircleIcon, SearchIcon } from '../../shared/icons';
import {
  KEY_DOWN,
  KEY_ENTER,
  KEY_ESC,
  KEY_FWD_SLASH,
  KEY_TAB,
  KEY_UP,
} from '../../shared/keys';
import { quick } from '../../shared/vars';
import { FixtureSearchResult } from './FixtureSearchResult';
import { FixtureSearchShortcuts } from './FixtureSearchShortcuts';

type Props = {
  searchText: string;
  fixturesDir: string;
  fixtureFileSuffix: string;
  fixtures: FixtureList;
  selectedFixtureId: null | FixtureId;
  onSetSearchText: (searchText: string) => unknown;
  onClose: () => unknown;
  onSelect: (fixtureId: FixtureId, revealFixture: boolean) => unknown;
};

type ActiveFixturePath = null | string;

type FixtureItemsByPath = Record<string, FlatFixtureTreeItem>;

export function FixtureSearchOverlay({
  searchText,
  fixturesDir,
  fixtureFileSuffix,
  fixtures,
  selectedFixtureId,
  onSetSearchText,
  onClose,
  onSelect,
}: Props) {
  // Fixture items are memoized purely to minimize computation
  const fixtureItems = useMemo<FixtureItemsByPath>(() => {
    const fixtureTree = createFixtureTree({
      fixtures,
      fixturesDir,
      fixtureFileSuffix,
    });
    const flatFixtureTree = flattenFixtureTree(fixtureTree);
    return flatFixtureTree.reduce((acc, item) => {
      const cleanPath = [...item.parents, item.fileName];
      if (item.name) cleanPath.push(item.name);
      return { ...acc, [cleanPath.join(' ')]: item };
    }, {});
  }, [fixtures, fixturesDir, fixtureFileSuffix]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSetSearchText(e.currentTarget.value);
    },
    [onSetSearchText]
  );

  const [matchingFixturePaths, setMatchingFixturePaths] = useState(
    getMatchingFixturePaths(fixtureItems, searchText)
  );

  const [activeFixturePath, setActiveFixturePath] = useState<ActiveFixturePath>(
    () => {
      const selectedFixturePath =
        selectedFixtureId && findFixturePath(fixtureItems, selectedFixtureId);
      return selectedFixturePath || getFirstFixturePath(matchingFixturePaths);
    }
  );

  useEffect(() => {
    const newMatchingFixturePaths = getMatchingFixturePaths(
      fixtureItems,
      searchText
    );

    if (!isEqual(newMatchingFixturePaths, matchingFixturePaths)) {
      setMatchingFixturePaths(newMatchingFixturePaths);
      // Reset active fixture to first matching fixture when search changes
      // WARNING: Putting this in a separate effect with only matchingFixturePaths
      // as a dependency looks nicer, but creates a flicker between some renders.
      // On searchText change, the component would first render a new list of
      // matching fixture paths (which may or may not contain the activeFixturePath),
      // and only in the (albeit almost instant) 2nd render would activeFixturePath
      // be updated to equal the first of the new list of matching fixture paths.
      setActiveFixturePath(getFirstFixturePath(newMatchingFixturePaths));
    }
  }, [fixtureItems, matchingFixturePaths, searchText]);

  const onInputKeyDown = useMemo(() => {
    function handleEscape() {
      onClose();
    }

    function handleEnter() {
      if (activeFixturePath !== null) {
        const { fixtureId } = fixtureItems[activeFixturePath];
        onSelect(fixtureId, true);
      }
    }

    function handleUp() {
      if (activeFixturePath) {
        const fixtureIndex = matchingFixturePaths.indexOf(activeFixturePath);
        if (fixtureIndex > 0) {
          setActiveFixturePath(matchingFixturePaths[fixtureIndex - 1]);
        }
      }
    }

    function handleDown() {
      if (activeFixturePath) {
        const fixtureIndex = matchingFixturePaths.indexOf(activeFixturePath);
        if (fixtureIndex < matchingFixturePaths.length - 1) {
          setActiveFixturePath(matchingFixturePaths[fixtureIndex + 1]);
        }
      }
    }

    function handleTab() {
      const matchingFixtureCount = matchingFixturePaths.length;
      if (matchingFixtureCount > 0) {
        if (!activeFixturePath) {
          setActiveFixturePath(matchingFixturePaths[0]);
        } else {
          const fixtureIndex = matchingFixturePaths.indexOf(activeFixturePath);
          const lastMatch = fixtureIndex === matchingFixtureCount - 1;
          if (lastMatch) {
            setActiveFixturePath(matchingFixturePaths[0]);
          } else {
            setActiveFixturePath(matchingFixturePaths[fixtureIndex + 1]);
          }
        }
      }
    }

    function handleTabReverse() {
      const matchingFixtureCount = matchingFixturePaths.length;
      if (matchingFixtureCount > 0) {
        if (!activeFixturePath) {
          setActiveFixturePath(matchingFixturePaths[matchingFixtureCount - 1]);
        } else {
          const fixtureIndex = matchingFixturePaths.indexOf(activeFixturePath);
          const lastMatch = fixtureIndex === 0;
          if (lastMatch) {
            setActiveFixturePath(
              matchingFixturePaths[matchingFixtureCount - 1]
            );
          } else {
            setActiveFixturePath(matchingFixturePaths[fixtureIndex - 1]);
          }
        }
      }
    }

    function handleQuestionMark(e: React.KeyboardEvent) {
      if (e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    }

    return (e: React.KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY_ESC:
          e.preventDefault();
          return handleEscape();
        case KEY_ENTER:
          e.preventDefault();
          return handleEnter();
        case KEY_UP:
          e.preventDefault();
          return handleUp();
        case KEY_DOWN:
          e.preventDefault();
          return handleDown();
        case KEY_TAB:
          e.preventDefault();
          return e.shiftKey ? handleTabReverse() : handleTab();
        case KEY_FWD_SLASH:
          return handleQuestionMark(e);
        default:
        // Nada
      }
    };
  }, [
    onClose,
    activeFixturePath,
    fixtureItems,
    onSelect,
    matchingFixturePaths,
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when search input is created
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // 1. Prevent click propagation to overlay element (which calls onClose)
  // 2. Keep user focused on search input while search is open
  const onContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleToggleHelp = useCallback(() => {
    setShowShortcuts(prev => !prev);
  }, []);

  return (
    <OverlayIE11 data-testid="fixtureSearchOverlay" onClick={onClose}>
      <Content data-testid="fixtureSearchContent" onClick={onContentClick}>
        <InputContainer>
          <SearchIconContainer>
            <SearchIcon />
          </SearchIconContainer>
          <SearchInput
            ref={inputRef}
            type="text"
            placeholder="Fixture search"
            value={searchText}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
          />
          <HelpButton selected={showShortcuts} onClick={handleToggleHelp}>
            <HelpCircleIcon />
          </HelpButton>
        </InputContainer>
        <ShortcutsContainer visible={showShortcuts}>
          <FixtureSearchShortcuts />
        </ShortcutsContainer>
        <ResultsViewport>
          <ResultsContainer>
            {matchingFixturePaths.map(cleanFixturePath => (
              <FixtureSearchResult
                key={cleanFixturePath}
                cleanFixturePath={cleanFixturePath}
                fixtureItem={fixtureItems[cleanFixturePath]}
                active={cleanFixturePath === activeFixturePath}
                onSelect={onSelect}
              />
            ))}
            {matchingFixturePaths.length === 0 && (
              <NoResults>No results</NoResults>
            )}
          </ResultsContainer>
        </ResultsViewport>
      </Content>
    </OverlayIE11>
  );
}

function findFixturePath(
  fixtureItems: FixtureItemsByPath,
  fixtureId: FixtureId
) {
  const fixturePaths = Object.keys(fixtureItems);
  return fixturePaths.find(fixturePath =>
    isEqual(fixtureItems[fixturePath].fixtureId, fixtureId)
  );
}

function getFirstFixturePath(fixturePaths: string[]): null | string {
  return fixturePaths.length > 0 ? fixturePaths[0] : null;
}

function getMatchingFixturePaths(
  fixtureItems: FixtureItemsByPath,
  searchText: string
): string[] {
  const fixturePaths = Object.keys(fixtureItems);

  if (searchText === '') {
    return fixturePaths;
  }

  const fixtureSearchTexts: string[] = [];
  fixturePaths.forEach(cleanFixturePath => {
    const { fixtureId, parents } = fixtureItems[cleanFixturePath];
    const { path, name } = fixtureId;
    // Allow fixtures to be searched by their entire file path, suffixed by
    // their name in the case of named fixtures, as well as by parent path,
    // allowing users to query results in the format they are displayed
    const searchPath = [path];
    if (name) searchPath.push(name);
    searchPath.push(...parents);
    fixtureSearchTexts.push(searchPath.join(' '));
  });

  const machingFixtureSearchTexts = filter(fixtureSearchTexts, searchText);
  return machingFixtureSearchTexts.map(fixtureSearchText => {
    const fixtureIndex = fixtureSearchTexts.indexOf(fixtureSearchText);
    return fixturePaths[fixtureIndex];
  });
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${black60};
`;

const OverlayIE11 = styled(Overlay)`
  z-index: 10;
`;

const Content = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0);
  width: 80%;
  max-width: 640px;
  border-radius: 3px;
  background: ${grey248};
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 5px 10px, rgba(15, 15, 15, 0.2) 0px 15px 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const InputContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 48px;
  padding: 0 12px;
  user-select: none;
  cursor: text;
`;

const SearchIconContainer = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin: 2px 0 0 0;
  padding: 0 10px 0 6px;
  color: ${grey176};
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: ${grey64};
  outline: none;
  font-size: 16px;
  line-height: 32px;

  ::placeholder {
    color: ${grey160};
  }
`;

const HelpButton = styled.div<{ selected: boolean }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin: 2px 0 0 0;
  padding: 6px;
  border-radius: 50%;
  background: ${props => (props.selected ? grey224 : 'transparent')};
  color: ${props => (props.selected ? grey128 : grey176)};
  cursor: pointer;
  transition: background ${quick}s, color ${quick}s;

  :hover {
    color: ${grey128};
  }
`;

const ShortcutsContainer = styled.div<{ visible: boolean }>`
  height: ${props => (props.visible ? 72 : 0)}px;
  overflow: hidden;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: height ${quick}s, opacity ${quick}s;
  user-select: none;
`;

const ResultsViewport = styled.div`
  max-height: 336px;
  border-top: 1px solid ${grey208};
  background: ${grey224};
  overflow-x: hidden;
  overflow-y: auto;
`;

const ResultsContainer = styled.div`
  padding: 8px 0;
`;

const NoResults = styled.div`
  padding: 0 24px 0 48px;
  line-height: 32px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  color: ${grey128};
`;
