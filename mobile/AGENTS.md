# PetCare Mobile AI Agent & Development Rules

1. **Development Guidelines**: Always refer to and strictly follow [MOBILE_GUIDELINES.md](file:///d:/SESSION_8/EXE2/WEB/PET_LOVE/mobile/MOBILE_GUIDELINES.md) for code structure, naming conventions, clean architecture, and component standards.
2. **Design System**: Use Stitch Modern Pet Care design tokens located in `src/core/theme` (Deep Navy `#00152D`/`#0B2A4A`, Golden Accent `#F5B82E`, Emerald `#10B981`, Plus Jakarta Sans typography).
3. **Routing vs Features**: `app/` is for Expo Router routing ONLY. All business logic, sub-components, screens, and API services live inside `src/features/<feature>/` and `src/core/`.
4. **Icons**: Use `lucide-react-native` or `@/core/components/Icon`.
5. **Expo SDK Version**: Expo SDK ~57.0.x with React 19.
