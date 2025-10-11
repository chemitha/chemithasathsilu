# Use an official Nginx image as the base image
FROM nginx:alpine

# Copy the contents of the public folder to the Nginx HTML directory
COPY public /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]