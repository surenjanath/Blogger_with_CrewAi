# Troubleshooting Guide

Common issues and solutions for the Blog Post Builder application.

## Ollama Connection Issues

### Problem: Cannot Connect to Ollama Server

**Symptoms**:
- Error message: "Cannot connect to Ollama server"
- Connection test fails
- Blog generation fails immediately

**Solutions**:

1. **Verify Ollama is Running**:
   ```bash
   # Check if Ollama is running
   ollama serve
   ```
   If not running, start Ollama service.

2. **Check Ollama Base URL**:
   - Default: `http://localhost:11434`
   - Verify in settings or `.env` file
   - Test with: `curl http://localhost:11434/api/tags`

3. **Check Firewall**:
   - Ensure port 11434 is not blocked
   - Check Windows Firewall or Linux iptables

4. **Test Connection via Settings**:
   - Go to `/settings/`
   - Click "Test Connection"
   - Check error message for details

5. **Check Ollama Logs**:
   - Look for error messages in Ollama console
   - Check system logs for connection issues

### Problem: Model Not Found

**Symptoms**:
- Error: "Model not found"
- Model name not recognized
- Generation fails with model error

**Solutions**:

1. **Verify Model is Downloaded**:
   ```bash
   ollama list
   ```
   Check if your model appears in the list.

2. **Download the Model**:
   ```bash
   ollama pull llama3
   # Or your specific model
   ```

3. **Check Model Name**:
   - Ensure model name matches exactly
   - Don't include `ollama/` prefix in settings
   - Example: Use `llama3`, not `ollama/llama3`

4. **Fetch Available Models**:
   - Go to Settings → Ollama Settings
   - Click "Fetch Models"
   - Select from available models

### Problem: Ollama Server Timeout

**Symptoms**:
- Connection timeout errors
- Slow or hanging requests
- Generation takes too long

**Solutions**:

1. **Check Ollama Performance**:
   - Monitor CPU and RAM usage
   - Ensure adequate system resources
   - Close other resource-intensive applications

2. **Use Smaller Model**:
   - Try a smaller model (e.g., `llama3.2` instead of `llama3`)
   - Smaller models are faster but may have lower quality

3. **Check Network**:
   - If using remote Ollama, check network connection
   - Test with: `curl http://your-ollama-url/api/tags`

4. **Increase Timeout**:
   - Check Django settings for timeout values
   - Consider increasing if using slow models

## Django Issues

### Problem: Migration Errors

**Symptoms**:
- Error when running `python manage.py migrate`
- Database schema errors
- Model field errors

**Solutions**:

1. **Check Virtual Environment**:
   ```bash
   # Ensure virtual environment is activated
   # Windows: venv\Scripts\activate
   # Linux/Mac: source venv/bin/activate
   ```

2. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Reset Database** (if needed):
   ```bash
   # Backup first!
   rm db.sqlite3
   python manage.py migrate
   ```

4. **Check for Pending Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Verify Django Version**:
   ```bash
   python -m django --version
   ```
   Ensure Django 4.2+ is installed.

### Problem: Missing Dependencies

**Symptoms**:
- Import errors
- Module not found errors
- Package installation errors

**Solutions**:

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Upgrade pip**:
   ```bash
   pip install --upgrade pip
   ```

3. **Check Python Version**:
   ```bash
   python --version
   ```
   Ensure Python 3.8+ is installed.

4. **Reinstall Dependencies**:
   ```bash
   pip uninstall -r requirements.txt -y
   pip install -r requirements.txt
   ```

### Problem: Static Files Not Loading

**Symptoms**:
- CSS/JavaScript not loading
- Broken styling
- 404 errors for static files

**Solutions**:

1. **Development Mode**:
   - Ensure `DEBUG=True` in settings
   - Django serves static files automatically in debug mode

2. **Collect Static Files** (Production):
   ```bash
   python manage.py collectstatic
   ```

3. **Check STATIC_URL**:
   - Verify `STATIC_URL = 'static/'` in settings.py
   - Check static file paths

4. **Clear Browser Cache**:
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Clear browser cache

5. **Check File Permissions**:
   - Ensure static files are readable
   - Check file paths are correct

### Problem: Server Won't Start

**Symptoms**:
- `python manage.py runserver` fails
- Port already in use
- Permission errors

**Solutions**:

1. **Check Port Availability**:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```
   Kill process if port is in use.

2. **Use Different Port**:
   ```bash
   python manage.py runserver 8001
   ```

3. **Check Permissions**:
   - Ensure you have write permissions
   - Check database file permissions

4. **Check for Syntax Errors**:
   ```bash
   python manage.py check
   ```

## Agent Processing Issues

### Problem: Blog Generation Fails or Hangs

**Symptoms**:
- Generation starts but never completes
- Status stuck on "processing"
- No error message

**Solutions**:

1. **Check Django Logs**:
   - Look for error messages in console
   - Check for exceptions or tracebacks

2. **Verify Ollama Model**:
   - Test model directly: `ollama run llama3`
   - Ensure model responds correctly

3. **Check System Resources**:
   - Monitor RAM usage (models need significant RAM)
   - Check CPU usage
   - Ensure adequate disk space

4. **Try Smaller Model**:
   - Use a smaller model if memory is limited
   - Example: `llama3.2` instead of `llama3`

5. **Check Ollama Server Logs**:
   - Look for errors in Ollama console
   - Check for timeout or memory errors

6. **Restart Services**:
   ```bash
   # Restart Ollama
   # Restart Django server
   ```

### Problem: Slow Generation

**Symptoms**:
- Generation takes very long
- Progress updates slowly
- System becomes unresponsive

**Solutions**:

1. **Use Faster Model**:
   - Smaller models are faster
   - Try `llama3.2` or `mistral` instead of larger models

2. **Reduce Blog Length**:
   - Use "short" instead of "long"
   - Shorter posts generate faster

3. **Optimize System**:
   - Close other applications
   - Free up RAM
   - Ensure adequate CPU resources

4. **Check Ollama Performance**:
   - Monitor Ollama resource usage
   - Consider using GPU if available
   - Check Ollama configuration

5. **Adjust Temperature**:
   - Lower temperature may be slightly faster
   - But may reduce creativity

### Problem: Poor Quality Output

**Symptoms**:
- Generated content is irrelevant
- Poor writing quality
- Doesn't follow instructions

**Solutions**:

1. **Try Different Model**:
   - Some models perform better than others
   - Try `llama3.2`, `mistral`, or other models
   - Test and compare results

2. **Adjust Temperature**:
   - Lower (0.3-0.5): More focused, consistent
   - Medium (0.7): Balanced (default)
   - Higher (0.9-1.2): More creative

3. **Provide Better Input**:
   - More detailed topic description
   - Specific key points
   - Clear examples
   - Appropriate tone selection

4. **Customize Agents**:
   - Improve agent goals and backstories
   - Make instructions more specific
   - Test different agent configurations

5. **Refine Tasks**:
   - Clearer task descriptions
   - Better expected outputs
   - Proper task dependencies

### Problem: Progress Not Updating

**Symptoms**:
- Progress bar doesn't move
- Status stuck
- No real-time updates

**Solutions**:

1. **Check Browser Console**:
   - Open developer tools (F12)
   - Look for JavaScript errors
   - Check network requests

2. **Verify API Endpoint**:
   - Test: `GET /api/post/{id}/`
   - Check if progress fields update
   - Verify response format

3. **Check Polling**:
   - Frontend polls every few seconds
   - Verify polling is active
   - Check for network errors

4. **Refresh Page**:
   - Sometimes fixes display issues
   - Progress continues in background

5. **Check Database**:
   - Verify progress fields update in database
   - Check `progress_percentage`, `current_agent`, etc.

## Database Issues

### Problem: Database Locked

**Symptoms**:
- Database errors
- Lock errors
- Write permission errors

**Solutions**:

1. **Close Other Connections**:
   - Close Django shell if open
   - Stop other Django processes
   - Check for multiple server instances

2. **Check File Permissions**:
   - Ensure database file is writable
   - Check file permissions

3. **Restart Server**:
   - Stop Django server
   - Restart to release locks

### Problem: Data Not Persisting

**Symptoms**:
- Changes not saved
- Data disappears
- Reset to default

**Solutions**:

1. **Check Database File**:
   - Verify `db.sqlite3` exists
   - Check file permissions
   - Ensure file is not read-only

2. **Verify Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Check Save Operations**:
   - Verify save() is called
   - Check for exceptions during save
   - Review Django logs

## Frontend Issues

### Problem: Page Not Loading

**Symptoms**:
- Blank page
- 404 errors
- Template errors

**Solutions**:

1. **Check URL Routes**:
   - Verify URLs are correct
   - Check `blog_app/urls.py`
   - Ensure templates exist

2. **Check Template Files**:
   - Verify templates are in correct location
   - Check template syntax
   - Look for template errors in console

3. **Clear Browser Cache**:
   - Hard refresh page
   - Clear browser cache
   - Try incognito mode

4. **Check Django Logs**:
   - Look for template errors
   - Check for missing files
   - Verify static files

### Problem: JavaScript Errors

**Symptoms**:
- Features not working
- Console errors
- Broken functionality

**Solutions**:

1. **Check Browser Console**:
   - Open developer tools (F12)
   - Look for JavaScript errors
   - Check error messages

2. **Verify JavaScript Files**:
   - Ensure JS files are loaded
   - Check file paths
   - Verify file permissions

3. **Check API Endpoints**:
   - Verify API endpoints are correct
   - Test endpoints directly
   - Check CORS if using different domain

4. **Update JavaScript**:
   - Clear browser cache
   - Hard refresh
   - Check for syntax errors

## Getting Help

### Debugging Steps

1. **Check Logs**:
   - Django console output
   - Browser console (F12)
   - Ollama logs

2. **Test Components**:
   - Test Ollama connection
   - Test API endpoints
   - Test database queries

3. **Isolate Problem**:
   - Try with default settings
   - Test with minimal configuration
   - Compare with working setup

4. **Check Documentation**:
   - Review relevant documentation
   - Check Django and CrewAI docs
   - Search for similar issues

### Reporting Issues

When reporting issues, include:

1. **Error Messages**:
   - Full error traceback
   - Console output
   - Browser console errors

2. **Configuration**:
   - Python version
   - Django version
   - Ollama model and version
   - Operating system

3. **Steps to Reproduce**:
   - Exact steps taken
   - Input provided
   - Expected vs actual behavior

4. **System Information**:
   - RAM and CPU
   - Available disk space
   - Network configuration

### Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Project Issues](https://github.com/your-repo/issues)

