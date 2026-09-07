#!/bin/bash
# n3wth skills installer
# Usage: curl -fsSL https://skills.n3wth.com/install.sh | bash -s -- [assistant|all] [skill-id ...]

set -e

SKILLS_INSTALL_HOME="${SKILLS_INSTALL_HOME:-$HOME}"

SKILLS_REPO="https://github.com/n3wth/n3wth.git"
SKILLS_DIR="$SKILLS_INSTALL_HOME/.skills"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}╭─────────────────────────────────────╮${NC}"
    echo -e "${BLUE}│${NC}    ${GREEN}n3wth skills installer${NC}            ${BLUE}│${NC}"
    echo -e "${BLUE}╰─────────────────────────────────────╯${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}→${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Detect platform
detect_platform() {
    case "$(uname -s)" in
        Darwin*) echo "macos" ;;
        Linux*)  echo "linux" ;;
        *)       echo "unknown" ;;
    esac
}

# Get skills source directory
get_skills_source() {
    # Check common locations
    if [ -d "$SKILLS_INSTALL_HOME/.claude/skills" ]; then
        echo "$SKILLS_INSTALL_HOME/.claude/skills"
    elif [ -d "$SKILLS_INSTALL_HOME/.gemini/skills" ]; then
        echo "$SKILLS_INSTALL_HOME/.gemini/skills"
    else
        echo ""
    fi
}

# Install for Gemini CLI
install_gemini() {
    print_info "Installing skills for Gemini CLI..."

    GEMINI_DIR="$SKILLS_INSTALL_HOME/.gemini"
    GEMINI_SKILLS="$GEMINI_DIR/skills"

    # Create directory if needed
    mkdir -p "$GEMINI_SKILLS"

    # Check if source skills exist
    SOURCE=$(get_skills_source)

    if [ -n "$SOURCE" ] && [ "$SOURCE" != "$GEMINI_SKILLS" ]; then
        print_info "Linking skills from $SOURCE"

        for skill in "$SOURCE"/*; do
            if [ -f "$skill" ] || [ -d "$skill" ]; then
                name=$(basename "$skill")
                if [ ! -e "$GEMINI_SKILLS/$name" ]; then
                    ln -s "$skill" "$GEMINI_SKILLS/$name"
                    print_success "Linked $name"
                else
                    print_warning "$name already exists, skipping"
                fi
            fi
        done
    else
        print_info "Downloading skills from repository..."

        # Clone to temp and copy skills
        TMP_DIR=$(mktemp -d)
        git clone --depth 1 "$SKILLS_REPO" "$TMP_DIR" 2>/dev/null || {
            print_error "Failed to clone skills repository"
            rm -rf "$TMP_DIR"
            exit 1
        }

        if [ -d "$TMP_DIR/apps/skills/skills" ]; then
            cp -r "$TMP_DIR/apps/skills/skills/"* "$GEMINI_SKILLS/" 2>/dev/null || true
        fi

        rm -rf "$TMP_DIR"
    fi

    # Update GEMINI.md if it exists
    if [ -f "$GEMINI_DIR/GEMINI.md" ]; then
        print_success "Gemini CLI configuration found"
    else
        print_warning "Create $GEMINI_DIR/GEMINI.md to configure skills"
    fi

    print_success "Gemini CLI skills installed to $GEMINI_SKILLS"
}

# Install for Claude Code
install_claude() {
    print_info "Installing skills for Claude Code..."

    CLAUDE_DIR="$SKILLS_INSTALL_HOME/.claude"
    CLAUDE_SKILLS="$CLAUDE_DIR/skills"

    # Create directory if needed
    mkdir -p "$CLAUDE_SKILLS"

    # Check if source skills exist
    SOURCE=$(get_skills_source)

    if [ -n "$SOURCE" ] && [ "$SOURCE" != "$CLAUDE_SKILLS" ]; then
        print_info "Linking skills from $SOURCE"

        for skill in "$SOURCE"/*; do
            if [ -f "$skill" ] || [ -d "$skill" ]; then
                name=$(basename "$skill")
                if [ ! -e "$CLAUDE_SKILLS/$name" ]; then
                    ln -s "$skill" "$CLAUDE_SKILLS/$name"
                    print_success "Linked $name"
                else
                    print_warning "$name already exists, skipping"
                fi
            fi
        done
    else
        print_info "Downloading skills from repository..."

        # Clone to temp and copy skills
        TMP_DIR=$(mktemp -d)
        git clone --depth 1 "$SKILLS_REPO" "$TMP_DIR" 2>/dev/null || {
            print_error "Failed to clone skills repository"
            rm -rf "$TMP_DIR"
            exit 1
        }

        if [ -d "$TMP_DIR/apps/skills/skills" ]; then
            cp -r "$TMP_DIR/apps/skills/skills/"* "$CLAUDE_SKILLS/" 2>/dev/null || true
        fi

        rm -rf "$TMP_DIR"
    fi

    # Check for settings.json
    if [ -f "$CLAUDE_DIR/settings.json" ]; then
        print_success "Claude Code configuration found"
    else
        print_warning "Create $CLAUDE_DIR/settings.json to configure skills"
    fi

    print_success "Claude Code skills installed to $CLAUDE_SKILLS"
}

# Install for Cursor
install_cursor() {
    print_info "Installing skills for Cursor..."

    CURSOR_DIR="$SKILLS_INSTALL_HOME/.cursor"
    CURSOR_SKILLS="$CURSOR_DIR/skills"

    # Create directory if needed
    mkdir -p "$CURSOR_SKILLS"

    # Check if source skills exist
    SOURCE=$(get_skills_source)

    if [ -n "$SOURCE" ] && [ "$SOURCE" != "$CURSOR_SKILLS" ]; then
        print_info "Linking skills from $SOURCE"

        for skill in "$SOURCE"/*; do
            if [ -f "$skill" ] || [ -d "$skill" ]; then
                name=$(basename "$skill")
                if [ ! -e "$CURSOR_SKILLS/$name" ]; then
                    ln -s "$skill" "$CURSOR_SKILLS/$name"
                    print_success "Linked $name"
                else
                    print_warning "$name already exists, skipping"
                fi
            fi
        done
    else
        print_info "Downloading skills from repository..."

        # Clone to temp and copy skills
        TMP_DIR=$(mktemp -d)
        git clone --depth 1 "$SKILLS_REPO" "$TMP_DIR" 2>/dev/null || {
            print_error "Failed to clone skills repository"
            rm -rf "$TMP_DIR"
            exit 1
        }

        if [ -d "$TMP_DIR/apps/skills/skills" ]; then
            cp -r "$TMP_DIR/apps/skills/skills/"* "$CURSOR_SKILLS/" 2>/dev/null || true
        fi

        rm -rf "$TMP_DIR"
    fi

    print_success "Cursor skills installed to $CURSOR_SKILLS"
}

# Install for Windsurf
install_windsurf() {
    print_info "Installing skills for Windsurf..."

    WINDSURF_DIR="$SKILLS_INSTALL_HOME/.windsurf"
    WINDSURF_SKILLS="$WINDSURF_DIR/skills"

    # Create directory if needed
    mkdir -p "$WINDSURF_SKILLS"

    # Check if source skills exist
    SOURCE=$(get_skills_source)

    if [ -n "$SOURCE" ] && [ "$SOURCE" != "$WINDSURF_SKILLS" ]; then
        print_info "Linking skills from $SOURCE"

        for skill in "$SOURCE"/*; do
            if [ -f "$skill" ] || [ -d "$skill" ]; then
                name=$(basename "$skill")
                if [ ! -e "$WINDSURF_SKILLS/$name" ]; then
                    ln -s "$skill" "$WINDSURF_SKILLS/$name"
                    print_success "Linked $name"
                else
                    print_warning "$name already exists, skipping"
                fi
            fi
        done
    else
        print_info "Downloading skills from repository..."

        # Clone to temp and copy skills
        TMP_DIR=$(mktemp -d)
        git clone --depth 1 "$SKILLS_REPO" "$TMP_DIR" 2>/dev/null || {
            print_error "Failed to clone skills repository"
            rm -rf "$TMP_DIR"
            exit 1
        }

        if [ -d "$TMP_DIR/apps/skills/skills" ]; then
            cp -r "$TMP_DIR/apps/skills/skills/"* "$WINDSURF_SKILLS/" 2>/dev/null || true
        fi

        rm -rf "$TMP_DIR"
    fi

    print_success "Windsurf skills installed to $WINDSURF_SKILLS"
}

# Install for Cody
install_cody() {
    print_info "Installing skills for Sourcegraph Cody..."

    CODY_DIR="$SKILLS_INSTALL_HOME/.cody"
    CODY_SKILLS="$CODY_DIR/skills"

    # Create directory if needed
    mkdir -p "$CODY_SKILLS"

    # Check if source skills exist
    SOURCE=$(get_skills_source)

    if [ -n "$SOURCE" ] && [ "$SOURCE" != "$CODY_SKILLS" ]; then
        print_info "Linking skills from $SOURCE"

        for skill in "$SOURCE"/*; do
            if [ -f "$skill" ] || [ -d "$skill" ]; then
                name=$(basename "$skill")
                if [ ! -e "$CODY_SKILLS/$name" ]; then
                    ln -s "$skill" "$CODY_SKILLS/$name"
                    print_success "Linked $name"
                else
                    print_warning "$name already exists, skipping"
                fi
            fi
        done
    else
        print_info "Downloading skills from repository..."

        # Clone to temp and copy skills
        TMP_DIR=$(mktemp -d)
        git clone --depth 1 "$SKILLS_REPO" "$TMP_DIR" 2>/dev/null || {
            print_error "Failed to clone skills repository"
            rm -rf "$TMP_DIR"
            exit 1
        }

        if [ -d "$TMP_DIR/apps/skills/skills" ]; then
            cp -r "$TMP_DIR/apps/skills/skills/"* "$CODY_SKILLS/" 2>/dev/null || true
        fi

        rm -rf "$TMP_DIR"
    fi

    print_success "Cody skills installed to $CODY_SKILLS"
}

# Install for GitHub Copilot
install_copilot() {
    print_info "Installing skills for GitHub Copilot..."

    COPILOT_DIR="$SKILLS_INSTALL_HOME/.copilot"
    COPILOT_SKILLS="$COPILOT_DIR/skills"

    # Create directory if needed
    mkdir -p "$COPILOT_SKILLS"

    # Check if source skills exist
    SOURCE=$(get_skills_source)

    if [ -n "$SOURCE" ] && [ "$SOURCE" != "$COPILOT_SKILLS" ]; then
        print_info "Linking skills from $SOURCE"

        for skill in "$SOURCE"/*; do
            if [ -f "$skill" ] || [ -d "$skill" ]; then
                name=$(basename "$skill")
                if [ ! -e "$COPILOT_SKILLS/$name" ]; then
                    ln -s "$skill" "$COPILOT_SKILLS/$name"
                    print_success "Linked $name"
                else
                    print_warning "$name already exists, skipping"
                fi
            fi
        done
    else
        print_info "Downloading skills from repository..."

        # Clone to temp and copy skills
        TMP_DIR=$(mktemp -d)
        git clone --depth 1 "$SKILLS_REPO" "$TMP_DIR" 2>/dev/null || {
            print_error "Failed to clone skills repository"
            rm -rf "$TMP_DIR"
            exit 1
        }

        if [ -d "$TMP_DIR/apps/skills/skills" ]; then
            cp -r "$TMP_DIR/apps/skills/skills/"* "$COPILOT_SKILLS/" 2>/dev/null || true
        fi

        rm -rf "$TMP_DIR"
    fi

    print_success "GitHub Copilot skills installed to $COPILOT_SKILLS"
}

install_selected() {
    local target="$1"
    shift
    local temporary source skill entry assistant destination
    temporary=$(mktemp -d)
    trap 'rm -rf "$temporary"' EXIT
    git clone --depth 1 "$SKILLS_REPO" "$temporary" 2>/dev/null || {
        print_error "Failed to clone skills repository"
        exit 1
    }
    source="$temporary/apps/skills/skills"

    # Validate the entire selection before modifying any assistant directory.
    for skill in "$@"; do
        case "$skill" in
            ''|*[!a-z0-9-]*) print_error "Invalid skill ID: $skill"; exit 1 ;;
        esac
        if [ ! -f "$source/$skill.md" ] && [ ! -f "$source/$skill/SKILL.md" ]; then
            print_error "Skill is not available: $skill"
            exit 1
        fi
    done

    local targets="$target"
    if [ "$target" = all ]; then
        targets="gemini claude cursor windsurf cody copilot"
    fi
    for assistant in $targets; do
        destination="$SKILLS_INSTALL_HOME/.$assistant/skills"
        mkdir -p "$destination"
        for skill in "$@"; do
            if [ -f "$source/$skill.md" ]; then
                entry="$skill.md"
            else
                entry="$skill"
            fi
            if [ -e "$destination/$entry" ] || [ -L "$destination/$entry" ]; then
                print_warning "$assistant/$entry already exists, skipping"
            else
                cp -R "$source/$entry" "$destination/$entry"
                print_success "Installed $skill for $assistant"
            fi
        done
    done
    rm -rf "$temporary"
    trap - EXIT
}

# Main
print_header

PLATFORM=$(detect_platform)
print_info "Detected platform: $PLATFORM"

TARGET="${1:-all}"
if [ "$#" -gt 0 ]; then shift; fi

case "$TARGET" in
    gemini|claude|cursor|windsurf|cody|copilot|all) ;;
    *) print_error "Unknown target: $TARGET"; exit 1 ;;
esac

if [ "$#" -gt 0 ]; then
    install_selected "$TARGET" "$@"
    print_success "Selected skills installed"
    exit 0
fi

case "$TARGET" in
    gemini)
        install_gemini
        ;;
    claude)
        install_claude
        ;;
    cursor)
        install_cursor
        ;;
    windsurf)
        install_windsurf
        ;;
    cody)
        install_cody
        ;;
    copilot)
        install_copilot
        ;;
    all)
        install_gemini
        echo ""
        install_claude
        echo ""
        install_cursor
        echo ""
        install_windsurf
        echo ""
        install_cody
        echo ""
        install_copilot
        ;;
    *)
        print_error "Unknown target: $TARGET"
        echo "Usage: $0 [gemini|claude|cursor|windsurf|cody|copilot|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart your AI assistant"
echo "  2. Try using a skill: /pdf, /xlsx, /gsap-animations"
echo ""
echo -e "Learn more at ${BLUE}https://skills.n3wth.com${NC}"
echo ""
