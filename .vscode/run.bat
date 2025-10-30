@echo off
set PATH_TO_FX="D:\SDKfx\javafx-sdk-25\lib"
java --module-path %PATH_TO_FX% --add-modules javafx.controls,javafx.web -cp src MainFrame
pause