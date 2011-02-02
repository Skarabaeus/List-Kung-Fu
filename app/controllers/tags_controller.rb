class TagsController < ApplicationController

	before_filter :authenticate_user!

  respond_to :xml

  def index
    @tags = current_user.tags.order( "name asc" )
    respond_with(@tags)
  end

  def show
    @tag = current_user.tags.where( "id = ?", params[:id] ).first
    respond_with(@tag)
  end

  def new
    @tag = Tag.new
    @tag.user = current_user

    respond_with( @tag ) do |format|
      format.js
    end
  end

  def edit
    @tag = current_user.tags.where( "id = ?", params[:id] ).first

    respond_with( @tag ) do |format|
      format.js
    end
  end

  def create
    @tag = Tag.new(params[:tag])
    @tag.user = current_user

    if @tag.save
      flash[:notice] = 'Tag has been created.'
    end

    respond_with( @tag )
  end

  def update
    @tag = current_user.tags.where( "id = ?", params[:id] ).first

    @tag.name = params[ :tag ][ :name ]
    @tag.color_class = params[ :tag ][ :color_class ]
    if @tag.save
      flash[:notice] = 'Tag has been updated.'
    end

    respond_with( @tag )
  end

  def destroy
    @tag = current_user.tags.where( "id = ?", params[:id] ).first
    @tag.destroy

    respond_with( @tag )
  end


end
