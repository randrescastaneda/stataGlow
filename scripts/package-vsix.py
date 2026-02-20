#!/usr/bin/env python3
"""
Package StataGlow extension as VSIX
This is a simplified VSIX creator for when vsce/npm are not available
"""

import json
import zipfile
from pathlib import Path

def create_vsix(project_root: Path):
    """Create a VSIX file from the extension project"""
    
    vsix_name = "stataGlow-2.0.0.vsix"
    vsix_path = project_root / vsix_name
    
    # Read package.json to get metadata
    with open(project_root / "package.json") as f:
        package_data = json.load(f)
    
    # Create VSIX as a ZIP archive
    with zipfile.ZipFile(vsix_path, 'w', zipfile.ZIP_DEFLATED) as vsix:
        # Add [Content_Types].xml (required for VSIX format)
        content_types_xml = '''<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json"/>
  <Default Extension="md" ContentType="text/markdown"/>
  <Default Extension="txt" ContentType="text/plain"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="js" ContentType="text/plain"/>
  <Default Extension="yaml" ContentType="text/plain"/>
  <Default Extension="yml" ContentType="text/plain"/>
  <Default Extension="cson" ContentType="text/plain"/>
  <Override PartName="/extension.vsixmanifest" ContentType="text/xml"/>
</Types>'''
        vsix.writestr('[Content_Types].xml', content_types_xml)
        
        # Add extension.vsixmanifest (required for VSIX format)
        vsix_manifest = f'''<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0"
  xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011"
  xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Id="{package_data['publisher']}.{package_data['name']}"
              Version="{package_data['version']}"
              Language="en-US"
              Publisher="{package_data['publisher']}" />
    <DisplayName>{package_data['displayName']}</DisplayName>
    <Description>{package_data['description']}</Description>
    <MoreInfo>https://github.com/randrescastaneda/stataGlow</MoreInfo>
    <License>LICENSE</License>
    <Icon>icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="package.json" d:Source="File" />
  </Assets>
</PackageManifest>'''
        vsix.writestr('extension.vsixmanifest', vsix_manifest)
        
        # Add project files recursively
        for file_path in project_root.rglob('*'):
            if file_path.is_file():
                relative_path = file_path.relative_to(project_root)
                
                # Skip unwanted files
                skip_extensions = {'.pyc', '.pyo', '.git', '__pycache__', '.pytest_cache', '.vsix', '.vsix.sha256'}
                if any(str(relative_path).startswith(skip) or str(relative_path).endswith(skip) for skip in skip_extensions):
                    continue
                
                # Skip node_modules, .vscode, scripts, .process (dev docs)
                skip_dirs = {'node_modules', '.vscode', '.git', '.gitignore', 'scripts', '.svg', '.process', 'temp'}
                if any(part in skip_dirs for part in relative_path.parts):
                    continue
                
                try:
                    vsix.write(file_path, arcname=str(relative_path))
                except Exception as e:
                    print(f"Warning: Could not add {relative_path}: {e}")
    
    size_mb = vsix_path.stat().st_size / (1024 * 1024)
    print(f"✓ Created {vsix_name} ({size_mb:.2f} MB)")
    print(f"  Location: {vsix_path}")
    return vsix_path

if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    create_vsix(project_root)
