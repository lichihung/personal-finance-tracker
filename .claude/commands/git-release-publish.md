Publish a GitHub release for this project. Follow these steps:

1. Read the current versionName from `frontend/android/app/build.gradle` — this is the release version (e.g. "1.1.0").
2. Find the most recent git tag using `git tag --sort=-version:refname | head -1`.
3. List commits since that tag with `git log <last-tag>..HEAD --oneline` and translate them into clean, user-facing release notes in English (not developer jargon). If there is no previous tag, use all commits.
4. Show the user the proposed tag name (e.g. `v1.1.0`) and release notes, and ask for confirmation before proceeding.
5. Once confirmed, run `gh release create v<versionName> --title "v<versionName>" --notes "<release notes>"`.
6. Print the URL of the created release.
