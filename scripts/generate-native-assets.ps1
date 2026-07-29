Add-Type -AssemblyName System.Drawing

$navy = [System.Drawing.ColorTranslator]::FromHtml('#092A40')
$splashNavy = [System.Drawing.ColorTranslator]::FromHtml('#06131D')
$lime = [System.Drawing.ColorTranslator]::FromHtml('#B9FF3F')

function Draw-GuFixLogo {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$Size
    )

    $scale = $Size / 512.0
    $brush = New-Object System.Drawing.SolidBrush($lime)
    $graphics.FillRectangle($brush, $X + (78 * $scale), $Y + (176 * $scale), 48 * $scale, 160 * $scale)
    $graphics.FillRectangle($brush, $X + (130 * $scale), $Y + (202 * $scale), 38 * $scale, 108 * $scale)
    $graphics.FillRectangle($brush, $X + (160 * $scale), $Y + (234 * $scale), 192 * $scale, 44 * $scale)
    $graphics.FillRectangle($brush, $X + (344 * $scale), $Y + (202 * $scale), 38 * $scale, 108 * $scale)
    $graphics.FillRectangle($brush, $X + (386 * $scale), $Y + (176 * $scale), 48 * $scale, 160 * $scale)
    $brush.Dispose()
}

function New-GuFixAsset {
    param(
        [string]$Path,
        [int]$Width,
        [int]$Height,
        [bool]$IsSplash
    )

    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear($(if ($IsSplash) { $splashNavy } else { $navy }))

    $logoSize = [Math]::Min($Width, $Height) * $(if ($IsSplash) { 0.25 } else { 0.82 })
    $x = ($Width - $logoSize) / 2
    $y = ($Height - $logoSize) / 2
    Draw-GuFixLogo -Graphics $graphics -X $x -Y $y -Size $logoSize

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

$iconPaths = @(
    'Mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
) + @(Get-ChildItem 'Mobile/android/app/src/main/res' -Recurse -Filter 'ic_launcher*.png' | ForEach-Object FullName)

foreach ($path in $iconPaths) {
    $resolved = if ([System.IO.Path]::IsPathRooted($path)) { $path } else { Join-Path $PSScriptRoot '..' $path }
    $current = [System.Drawing.Image]::FromFile($resolved)
    $width = $current.Width
    $height = $current.Height
    $current.Dispose()
    New-GuFixAsset -Path $resolved -Width $width -Height $height -IsSplash $false
}

$splashPaths = @(
    Get-ChildItem 'Mobile/android/app/src/main/res' -Recurse -Filter 'splash.png'
    Get-ChildItem 'Mobile/ios/App/App/Assets.xcassets/Splash.imageset' -Filter '*.png'
)

foreach ($file in $splashPaths) {
    $current = [System.Drawing.Image]::FromFile($file.FullName)
    $width = $current.Width
    $height = $current.Height
    $current.Dispose()
    New-GuFixAsset -Path $file.FullName -Width $width -Height $height -IsSplash $true
}

Write-Output 'GuFix native icons and splash screens generated.'
